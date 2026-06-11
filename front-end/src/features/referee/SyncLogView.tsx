import React, { useState, useEffect } from 'react'
import Icon from '../../components/shared/Icon'
import { competitionApi } from '../../data/api'

export default function SyncLogView() {
  const [queue, setQueue] = useState<any[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const loadQueue = () => {
    const q = JSON.parse(localStorage.getItem('referee_sync_queue') || '[]')
    setQueue(q)
  }

  useEffect(() => {
    loadQueue()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Also listen to a custom event if queue is updated
    window.addEventListener('sync_queue_updated', loadQueue)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('sync_queue_updated', loadQueue)
    }
  }, [])

  const syncAll = async () => {
    if (!isOnline) {
      alert('Không có kết nối mạng!')
      return
    }

    const currentQueue = JSON.parse(localStorage.getItem('referee_sync_queue') || '[]')
    if (currentQueue.length === 0) return

    setIsSyncing(true)
    let newSuccess = successCount
    let newError = errorCount
    const remainingQueue = []

    for (const item of currentQueue) {
      try {
        if (item.type === 'START_MATCH') {
          await competitionApi.startMatch(item.matchId)
        } else if (item.type === 'SCORE') {
          await competitionApi.addScoreEvent(item.matchId, item.payload)
        } else if (item.type === 'SET') {
          await competitionApi.addSetScore(item.matchId, item.payload)
        } else if (item.type === 'COMPLETE') {
          await competitionApi.completeMatch(item.matchId)
        } else if (item.type === 'RESULT') {
          await competitionApi.setResult(item.matchId, item.payload)
        } else if (item.type === 'UNDO') {
          await competitionApi.undoScore(item.matchId)
        }
        newSuccess++
      } catch (e) {
        console.error('Sync error for item', item, e)
        newError++
        remainingQueue.push(item) // Keep it in queue if it failed
      }
    }

    localStorage.setItem('referee_sync_queue', JSON.stringify(remainingQueue))
    setSuccessCount(newSuccess)
    setErrorCount(newError)
    setQueue(remainingQueue)
    setIsSyncing(false)
  }

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      syncAll()
    }
  }, [isOnline])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="font-serif font-bold text-2xl uppercase tracking-wide">Trạng thái đồng bộ (BM22)</h1>
          <div className="text-sm text-[var(--ink-2)] mt-1">Tự động đẩy dữ liệu điểm số khi có mạng</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-3xl font-mono font-bold text-[var(--ink)]">{queue.length}</div>
          <div className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wider mt-1 text-center">Sự kiện chờ đẩy</div>
        </div>
        <div className="bg-[var(--court)]/10 border border-[var(--court)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-3xl font-mono font-bold text-[var(--court)]">{successCount}</div>
          <div className="text-xs font-semibold text-[var(--court)] uppercase tracking-wider mt-1 text-center">Đã đẩy (OK)</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center">
          <div className="text-3xl font-mono font-bold text-amber-600">0</div>
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mt-1 text-center">Từ chối (Trùng)</div>
        </div>
        <div className="bg-[var(--accent-soft)] border border-[var(--accent)] rounded-xl p-4 flex flex-col items-center">
          <div className="text-3xl font-mono font-bold text-[var(--accent)]">{errorCount}</div>
          <div className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mt-1 text-center">Bị xung đột / Lỗi</div>
        </div>
      </div>

      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--line)] flex justify-between items-center bg-[var(--paper-2)]">
          <div className="font-semibold text-sm">Hàng đợi ({queue.length})</div>
          <button 
            onClick={syncAll}
            disabled={isSyncing || !isOnline || queue.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--ink)] text-white text-xs font-semibold disabled:opacity-50"
          >
            <Icon name="refresh-cw" size={12} className={isSyncing ? 'animate-spin' : ''} />
            Đẩy dữ liệu thủ công
          </button>
        </div>
        {queue.length === 0 ? (
          <div className="p-8 text-center text-[var(--ink-3)] text-sm flex flex-col items-center">
            <Icon name="check-circle" size={32} className="mb-2 text-green-500/50" />
            Không có dữ liệu chờ đồng bộ. Mọi thứ đã được đẩy lên server!
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {queue.map((item, i) => (
              <div key={i} className="px-5 py-3 border-b border-[var(--line-2)] flex justify-between items-center text-sm">
                <div>
                  <span className="font-mono font-bold mr-3">{item.type}</span>
                  <span className="text-[var(--ink-2)]">Match #{item.matchId}</span>
                  {item.payload && <span className="text-[var(--ink-3)] ml-2 text-xs">{JSON.stringify(item.payload)}</span>}
                </div>
                <div className="text-xs text-[var(--ink-3)] font-mono">{new Date(item.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
