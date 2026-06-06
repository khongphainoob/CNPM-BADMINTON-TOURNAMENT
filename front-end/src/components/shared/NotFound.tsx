import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { Button } from '../ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[var(--paper)] text-[var(--ink)] p-6">
      <div className="w-24 h-24 mb-8 text-[var(--line-2)]">
        <Icon name="map-pin" size={96} />
      </div>
      <h1 className="font-serif font-black text-6xl tracking-tighter mb-4 text-[var(--ink)]">404</h1>
      <h2 className="font-serif font-bold text-2xl mb-2 text-[var(--ink-2)]">Trang không tồn tại</h2>
      <p className="text-[var(--ink-3)] text-center max-w-sm mb-8">
        Có vẻ như đường dẫn bạn đang truy cập không đúng hoặc trang này đã bị xóa khỏi hệ thống.
      </p>
      <div className="flex gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <Icon name="arrow-left" size={16} className="mr-2" />
          Quay lại
        </Button>
        <Button onClick={() => navigate('/')}>
          <Icon name="home" size={16} className="mr-2" />
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
