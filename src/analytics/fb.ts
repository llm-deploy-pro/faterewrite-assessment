// src/analytics/fb.ts
// Facebook Pixel 统一管理模块 - 最终版本
// 
// 核心设计原则:
// 1. HTML 中只保留 Pixel 加载器和首次 init
// 2. 应用代码通过 fbq('set', 'user') 设置 external_id
// 3. eventID 每次唯一,不用于前端去重
// 4. 跨子域通过根域 Cookie 共享 frid
// 5. 支付页始终上报 PageView,只用参数标注是否跨域继续

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

/** 
 * ✅ 生成唯一的 eventID
 * - 每次调用都生成不同的 ID
 * - 格式: <eventName>:<frid>:<timestamp36>:<random>
 * - 不使用稳定ID,因为单Pixel通道不支持eventID去重
 * 
 * @param eventName - 事件名称,如 'PageView'
 * @param frid - 用户唯一标识
 * @returns 唯一的事件ID字符串
 */
function buildEventID(eventName: string, frid: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${eventName}:${frid}:${timestamp}:${random}`;
}

/** 
 * ✅ 获取或生成用户唯一标识 (frid)
 * - 存储在根域 Cookie (.faterewrite.com)
 * - LP 页和支付页都能读取同一个 frid
 * - 30 天有效期
 * - 优先使用内存缓存避免重复读取 Cookie
 * 
 * @returns 用户唯一标识字符串,格式: fr_<timestamp36>_<random>
 */
export function ensureFrid(): string {
  const win = window as any;
  
  // 优先使用内存缓存
  if (win.__frid) return win.__frid;
  
  // 从 Cookie 读取
  let frid = getCookie('frd_uid');
  
  // 不存在则生成新的
  if (!frid) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    frid = `fr_${timestamp}_${random}`;
    
    // 写入根域 Cookie,30天有效期
    setCookieRoot('frd_uid', frid, 30);
  }
  
  // 缓存到内存
  win.__frid = frid;
  
  return frid;
}

/** 
 * ✅ 设置 Facebook Pixel 的 external_id (高级匹配)
 * 
 * 改进说明:
 * - HTML 中已经调用了 fbq('init', '1456840718702401')
 * - 这里不再二次 init,而是通过 fbq('set', 'user') 设置 external_id
 * - 避免了双重 init 可能带来的不可预期行为
 * - 确保只设置一次,通过 __pixelUserSet 标记防重
 * 
 * 使用方式:
 * 在应用启动时调用一次即可,最好在 PageView 触发之前
 */
export function initPixelWithExternalId(): void {
  const win = window as any;

  // 防止重复设置
  if (win.__pixelUserSet) {
    console.log('[Pixel] external_id already set, skipping');
    return;
  }
  
  // 等待 fbq 加载完成
  if (typeof win.fbq !== 'function') {
    console.warn('[Pixel] fbq not ready, will retry in 200ms');
    setTimeout(initPixelWithExternalId, 200);
    return;
  }

  // 获取用户唯一标识
  const frid = ensureFrid();
  
  // ✅ 不再二次 init，直接设置 user（高级匹配）
  // 这会将 external_id 与 Pixel 关联,帮助 Facebook 更准确地识别用户
  win.fbq('set', 'user', { external_id: frid });

  // 标记已设置
  win.__pixelUserSet = true;
  
  console.log('[Pixel] Set external_id via fbq("set", "user"):', frid);
}

// ============================================================
// ✅ PageView 追踪与去重
// ============================================================

// 内存去重集合:存储本次页面加载已触发的 PageView
const firedPageViews = new Set<string>();

/**
 * ✅ 检查是否是跨子域访问的继续
 * 
 * 判断逻辑:
 * - 通过 document.referrer 判断上一个页面的域名
 * - 如果当前是支付页(pay.faterewrite.com),referrer 是 LP 页(circles.faterewrite.com),返回 true
 * - 其他情况返回 false
 * 
 * 重要:这个函数只用于设置 cross_domain_continuation 参数,不影响是否上报 PageView
 * 
 * @returns true 表示是跨域继续,false 表示不是
 */
function isCrossDomainContinuation(): boolean {
  try {
    const referrer = document.referrer;
    if (!referrer) return false;
    
    const referrerUrl = new URL(referrer);
    const currentHost = window.location.hostname;
    const referrerHost = referrerUrl.hostname;
    
    // 如果当前是支付页,referrer 是 LP 页,认为是跨域继续
    if (currentHost === 'pay.faterewrite.com' && referrerHost === 'circles.faterewrite.com') {
      return true;
    }
    
    // 其他情况都认为不是跨域继续
    return false;
  } catch (error) {
    console.warn('[Pixel] Failed to check cross-domain continuation:', error);
    return false;
  }
}

/**
 * ✅ 触发 PageView 事件(带去重)
 * 
 * 核心特性:
 * 1. 始终上报 PageView,不会因为 isCrossDomainContinuation 而跳过
 * 2. eventID 每次唯一,不复用
 * 3. 添加 cross_domain_continuation 参数用于分析
 * 4. 使用双重去重:内存 Set + sessionStorage
 * 5. 页面不可见时延迟到可见再触发
 * 
 * 去重策略:
 * - 去重键格式: pageview:<pageType>:<path>
 * - 先检查内存 Set,再检查 sessionStorage
 * - 触发后同时写入内存和 sessionStorage
 * - 这确保了同一次页面加载只触发一次,即使组件多次挂载(如 React.StrictMode)
 * 
 * @param pageType - 页面类型,如 'LP' 或 'Checkout'
 * @param extras - 额外参数
 *   - path: 页面路径(可选,默认使用 location.pathname + search)
 *   - title: 页面标题(可选,默认使用 document.title)
 *   - referrer: 来源页面(可选,默认使用 document.referrer)
 */
export function trackPageViewOnce(
  pageType: string,
  extras?: {
    path?: string;
    title?: string;
    referrer?: string;
  }
): void {
  const win = window as any;
  
  // 检查 fbq 是否已加载
  if (typeof win.fbq !== 'function') {
    console.error('[Pixel] fbq not available, cannot track PageView');
    return;
  }
  
  // 生成去重键(基于页面类型和路径)
  const path = extras?.path || (window.location.pathname + window.location.search);
  const dedupeKey = `pageview:${pageType}:${path}`;
  
  // 第一层去重:检查内存 Set
  if (firedPageViews.has(dedupeKey)) {
    console.log('[Pixel] PageView already tracked in this session (memory):', dedupeKey);
    return;
  }
  
  // 第二层去重:检查 sessionStorage
  try {
    const sessionKey = `__pv_${dedupeKey}`;
    if (sessionStorage.getItem(sessionKey) === '1') {
      console.log('[Pixel] PageView already tracked in this session (storage):', dedupeKey);
      // 同步到内存去重集合
      firedPageViews.add(dedupeKey);
      return;
    }
  } catch (error) {
    // sessionStorage 不可用时不阻塞,继续执行
    console.warn('[Pixel] sessionStorage check failed:', error);
  }
  
  // 检查页面可见性
  // 如果页面在后台标签页中,延迟到可见时再触发
  if (document.visibilityState !== 'visible') {
    console.log('[Pixel] Page not visible, deferring PageView until visible');
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        // 递归调用,但这次页面已可见
        trackPageViewOnce(pageType, extras);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return;
  }
  
  // 准备事件数据
  const frid = ensureFrid();
  const isContinuation = isCrossDomainContinuation();
  
  // ✅ 每次生成唯一的 eventID
  const eventId = buildEventID('PageView', frid);
  
  const eventData = {
    page_type: pageType,
    page_path: path,
    page_title: extras?.title || document.title,
    referrer: extras?.referrer || document.referrer,
    frid: frid,
    // ✅ 标注是否是跨域继续(用于分析),但不影响上报
    cross_domain_continuation: isContinuation ? 1 : 0
  };
  
  // ✅ 始终发送 PageView 事件(不会因为 isContinuation 而跳过)
  try {
    win.fbq('track', 'PageView', eventData, { eventID: eventId });
    
    console.log('[Pixel] PageView tracked:', {
      pageType,
      eventId,
      eventData
    });
    
    // 标记已触发:写入内存
    firedPageViews.add(dedupeKey);
    
    // 标记已触发:写入 sessionStorage
    try {
      const sessionKey = `__pv_${dedupeKey}`;
      sessionStorage.setItem(sessionKey, '1');
    } catch (error) {
      console.warn('[Pixel] Failed to mark in sessionStorage:', error);
    }
  } catch (error) {
    console.error('[Pixel] Failed to track PageView:', error);
  }
}

/** 
 * 简易 UUID 生成器
 * 使用 Web Crypto API 生成符合 RFC4122 v4 标准的 UUID
 * 用于生成事件 ID 等需要唯一标识的场景
 * 
 * @returns UUID 字符串,格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function uuid(): string {
  // 使用 Web Crypto 生成随机数
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  
  // RFC4122 v4 要求特定位置的特定值
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
 * ✅ 优化后的 FB 事件上报函数
 * 
 * 用于触发自定义事件(非 PageView)
 * 特性:
 * - 自动为每个事件生成唯一的 event_id
 * - 支持像素未就绪时的队列机制
 * - 开发环境提供详细日志
 * - 失败重试机制(最多 10 次,共 4 秒)
 * 
 * @param eventName - 事件名称,如 'S1_Front_CTA_Click'
 * @param payload - 事件参数对象
 * 
 * @example
 * emitFB('S1_Front_CTA_Click', {
 *   value: 49,
 *   currency: 'USD',
 *   content_name: 'Assessment_CTA'
 * });
 */
export function emitFB(eventName: string, payload: Record<string, any> = {}) {
  try {
    const w = window as any;
    const evt = { ...payload };
    
    // ✅ 确保每个事件都有唯一的 event_id
    if (!evt.event_id && !evt.eventId) {
      const frid = ensureFrid();
      evt.event_id = buildEventID(eventName, frid);
    }
    
    // ✅ 像素已就绪：立即发送
    if (typeof w.fbq === 'function') {
      w.fbq('trackCustom', eventName, evt);
      
      // 开发环境日志
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.log('[📘 FB Event]', eventName, evt);
      }
      return;
    }
    
    // ✅ 像素未就绪：加入队列，延迟发送
    w.__fbqQueue = w.__fbqQueue || [];
    w.__fbqQueue.push({ name: eventName, payload: evt });
    
    // 开发环境警告
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn('[📘 FB Event Queued]', eventName, 'fbq not ready yet');
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
              console.log('[📘 FB Event (Queued)]', item.name, item.payload);
            }
          });
        } else {
          // 最多重试 10 次（4 秒）
          if ((w.__fbqQueueRetries || 0) < 10) {
            w.__fbqQueueRetries = (w.__fbqQueueRetries || 0) + 1;
            setTimeout(tryFlush, 400);
          } else {
            console.error('[📘 FB Queue Timeout]', 'fbq failed to load after 4s');
          }
        }
      };
      setTimeout(tryFlush, 300);
    }
  } catch (error) {
    // 开发环境输出错误
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error('[❌ FB Event Error]', eventName, error);
    }
  }
}