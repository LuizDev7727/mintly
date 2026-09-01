type SetDelayProps = {
  delayInMs: number;
}

export async function setDelay({ delayInMs }: SetDelayProps): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, delayInMs));
}
