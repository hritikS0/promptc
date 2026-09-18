import Conf from "conf";

const config = new Conf({ projectName: "promptc" });

export function getApiKey(): string | undefined {
  const envKey = process.env.NVIDIA_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  const storedKey = config.get("NVIDIA_API_KEY") as string | undefined;
  if (storedKey && storedKey.trim().length > 0) {
    return storedKey.trim();
  }

  return undefined;
}

export function setApiKey(key: string): void {
  config.set("NVIDIA_API_KEY", key.trim());
}

export function clearApiKey(): void {
  config.delete("NVIDIA_API_KEY");
}

export function getConfigPath(): string {
  return config.path;
}
