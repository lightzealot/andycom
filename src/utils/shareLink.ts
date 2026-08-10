export type ShareTarget = 'post' | 'evento';

export function buildShareUrl(target: ShareTarget, id: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', target === 'post' ? 'comunidad' : 'calendario');
  url.searchParams.delete(target === 'post' ? 'evento' : 'post');
  url.searchParams.set(target, id);
  url.hash = '';
  return url.toString();
}

export async function shareLink(title: string, url: string): Promise<'shared' | 'copied'> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, url });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }

  await navigator.clipboard.writeText(url);
  return 'copied';
}
