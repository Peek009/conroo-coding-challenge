export function createSseLineParser(onData: (data: string) => void) {
  let buffer = ''

  return function feed(chunk: string): void {
    buffer += chunk.replace(/\r/g, '')

    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const data = block
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice('data:'.length).trim())
        .join('\n')

      if (data) {
        onData(data)
      }
    }
  }
}
