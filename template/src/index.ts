export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return new Response('', { status: 204 })

    const url = new URL(request.url)

    const hostArr = url.host.split('.')
    let subdomain = ''
    let domain = ''
    if (hostArr.length > 2) {
      subdomain = hostArr[0]
      domain = hostArr.slice(1).join('.')
    }
    else if (hostArr.length === 2) {
      subdomain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[0] : ''
      domain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[1] : hostArr.join('.')
    }
    else {
      domain = hostArr.join('.')
    }

    if (url.pathname === '/robots.txt')
      return new Response('User-agent: *\nDisallow: /', { status: 200 })

    // ============ 逻辑处理 ============
    //
    //

    return new Response(`Unsupported domain ${subdomain ? `${subdomain}.` : ''}${domain}`, {
      status: 200,
      headers: { 'content-type': 'text/plain;charset=utf-8', 'git-hash': env.GIT_HASH },
    })
  },
}

/**
 * 需要终止请求
 * @param request
 * @returns true: 需要终止请求
 */
async function needCancelRequest(request: Request, matches: string[] = []): Promise<boolean> {
  const url = new URL(request.url)
  matches = matches.length
    ? matches
    : [
      '/favicon.',
      '/sw.js',
    ]
  return matches.some(match => url.pathname.includes(match))
}
