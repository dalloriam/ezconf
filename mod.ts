import * as fs from 'https://deno.land/std@0.107.0/fs/mod.ts';
import * as path from 'https://deno.land/std@0.107.0/path/mod.ts';

function getBaseConfigDir(): string {
    switch (Deno.build.os) {
        case 'linux': {
            const xdg = Deno.env.get('XDG_CONFIG_HOME');
            if (xdg) {
                return xdg;
            }

            const home = Deno.env.get('HOME');
            if (home) {
                return `${home}/.config`;
            }
            break;
        }
        case 'darwin': {
            const home = Deno.env.get('HOME');
            if (home) {
                return `${home}/Library/Application Support`;
            }
            break;
        }

        case 'windows': {
            const cfgDir = Deno.env.get('FOLDERID_LocalAppData');
            if (cfgDir) {
                return cfgDir;
            }
            break;
        }
    }

    throw Error('didn\'t find configuration directory');
}

export async function loadConfig<T>(namespace: string, name: string) {
    const configDir = getBaseConfigDir();
    const configPath = path.join(configDir, namespace, name) + '.json';

    if (!await fs.exists(configPath)) {
        throw Error(`config file '${configPath} does not exist'`);
    }

    const rawConfig = await Deno.readTextFile(configPath);
    return JSON.parse(rawConfig) as T;
}

export async function writeConfig<T>(namespace: string, name: string, config: T) {
    const configDir = getBaseConfigDir();
    const nsDir = path.join(configDir, namespace);

    if (!await fs.exists(nsDir)) {
        await Deno.mkdir(nsDir, { recursive: true });
    }

    const configPath = path.join(configDir, namespace, name) + '.json';

    const rawConfig = JSON.stringify(config);
    await Deno.writeTextFile(configPath, rawConfig);
}
