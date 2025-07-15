// 获取Cloudflare D1绑定的辅助函数
export function getCloudflareBinding(bindingName: string = 'DB'): any {
  // 检查是否在Cloudflare环境中
  if (typeof globalThis !== 'undefined') {
    // 尝试从各种可能的位置获取绑定
    const locations = [
      (globalThis as any)[bindingName],
      (globalThis as any).env?.[bindingName],
      (globalThis as any).ASSETS?.env?.[bindingName],
      (globalThis as any).__env__?.[bindingName],
    ];
    
    for (const binding of locations) {
      if (binding) {
        console.log('找到D1绑定:', bindingName);
        return binding;
      }
    }
  }
  
  // 检查process.env（虽然在Edge Runtime中通常不可用）
  if (typeof process !== 'undefined' && (process as any).env?.[bindingName]) {
    console.log('从process.env找到绑定:', bindingName);
    return (process as any).env[bindingName];
  }
  
  console.log('未找到D1绑定:', bindingName);
  return null;
}

// 检查当前运行环境
export function getEnvironmentInfo() {
  return {
    isCloudflare: typeof globalThis !== 'undefined' && 
                  ((globalThis as any).navigator?.userAgent?.includes('Cloudflare') || 
                   (globalThis as any).process?.env?.CLOUDFLARE_PAGES === '1'),
    isEdgeRuntime: typeof globalThis !== 'undefined' && 
                   (globalThis as any).EdgeRuntime !== undefined,
    hasProcess: typeof process !== 'undefined',
    nodeEnv: typeof process !== 'undefined' ? (process as any).env?.NODE_ENV : 'unknown',
    availableGlobals: typeof globalThis !== 'undefined' ? 
                      Object.keys(globalThis).filter(key => 
                        ['env', 'DB', '__env__', 'ASSETS'].includes(key)
                      ) : [],
  };
}