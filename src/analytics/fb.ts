// src/analytics/fb.ts
// Helpers used by checkout page

/** 读取 URL 参数 */
export function getQueryParam(name: string, url = window.location.href): string {
  try {
    return new URL(url).searchParams.get(name) || '';
  } catch {
    return '';
  }
}

/** 写 cookie（默认写到根域，便于子域共享） */
function setCookie(name: string, value: string, days = 7, domain = '.faterewrite.com') {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;domain=${domain};SameSite=Lax`;
}

/** 跨环境写 cookie：生产写根域，本地/非目标域退化为当前域 */
export function setCookieRoot(name: string, value: string, days = 7, rootDomain = '.faterewrite.com') {
  try {
    const host = location.hostname || '';
    const isLocal = host === 'localhost' || /^[0-9.]+$/.test(host);
    if (isLocal || !host.endsWith(rootDomain.replace(/^\./, ''))) {
      // 本地或非目标域：不写 domain
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
      return;
    }
    setCookie(name, value, days, rootDomain);
  } catch {
    /* noop */
  }
}

/** 读 cookie */
export function getCookie(name: string): string {
  const m = document.cookie.split('; ').find(c => c.startsWith(name + '='));
  return m ? decodeURIComponent(m.split('=')[1]) : '';
}

/**
 * 基于 fbclid 生成 _fbc（Meta 规范：fb.1.<timestamp>.<fbclid>）
 * - 如果 URL 上有 fbclid 且当前没有 _fbc，就写入 _fbc
 * - 同时把 fbclid 也缓存到 _fbclid，便于后续页面使用
 */
export function ensureFBC(): void {
  const fromQuery = getQueryParam('fbclid');
  const cachedFbclid = getCookie('_fbclid');
  const fbclid = fromQuery || cachedFbclid;

  const existingFbc = getCookie('_fbc');

  if (fbclid && !existingFbc) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    setCookieRoot('_fbc', fbc);
  }
  if (fbclid && !cachedFbclid) {
    setCookieRoot('_fbclid', fbclid);
  }
}

/** 简易 UUID，用于 event_id 去重等场景 */
export function uuid(): string {
  // 使用 Web Crypto 生成随机数
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  // RFC4122 v4
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;

  const hex = [...arr].map(b => b.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

/** 
 *  优化后的 FB 事件上报函数
 * - 自动补充 event_id 用于去重
 * - 支持像素未就绪时的队列机制
 * - 开发环境日志输出
 * - 修复：确保 fbq 加载完成后再发送事件
 */
export function emitFB(eventName: string, payload: Record<string, any> = {}) {
  try {
    const w = window as any;
    const evt = { ...payload };
    
    //  确保每个事件都有 event_id（FB 服务端去重关键）
    if (!evt.event_id && !evt.eventId) {
      evt.event_id = uuid();
    }
    
    //  像素已就绪：立即发送
    if (typeof w.fbq === 'function') {
      w.fbq('trackCustom', eventName, evt);
      
      // 开发环境日志
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.log('[ FB Event]', eventName, evt);
      }
      return;
    }
    
    //  像素未就绪：加入队列，延迟发送
    w.__fbqQueue = w.__fbqQueue || [];
    w.__fbqQueue.push({ name: eventName, payload: evt });
    
    // 开发环境警告
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn('[ FB Event Queued]', eventName, 'fbq not ready yet');
    }
    
    // 安装一次性 flush 轮询器
    if (!w.__fbqQueueFlusherInstalled) {
      w.__fbqQueueFlusherInstalled = true;
      const tryFlush = () => {
        if (typeof w.fbq === 'function' && Array.isArray(w.__fbqQueue)) {
          const q = w.__fbqQueue.splice(0, w.__fbqQueue.length);
          q.forEach((item: any) => {
            w.fbq('trackCustom', item.name, item.payload);
            if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
              console.log('[ FB Event (Queued)]', item.name, item.payload);
            }
          });
        } else {
          // 最多重试 10 次（4 秒）
          if ((w.__fbqQueueRetries || 0) < 10) {
            w.__fbqQueueRetries = (w.__fbqQueueRetries || 0) + 1;
            setTimeout(tryFlush, 400);
          } else {
            console.error('[ FB Queue Timeout]', 'fbq failed to load after 4s');
          }
        }
      };
      setTimeout(tryFlush, 300);
    }
  } catch (error) {
    // 开发环境输出错误
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error('[ FB Event Error]', eventName, error);
    }
  }
}
