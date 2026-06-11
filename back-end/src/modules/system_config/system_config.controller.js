import { getConfigs, updateConfigs } from './system_config.service.js';
import { success } from '../../utils/response.js';

export async function getConfigsHandler(req, res, next) {
  try {
    const data = await getConfigs();
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}

export async function updateConfigsHandler(req, res, next) {
  try {
    const data = await updateConfigs(req.body);
    return success(res, data);
  } catch (e) {
    return next(e);
  }
}
