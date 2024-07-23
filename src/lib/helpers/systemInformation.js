const si = require('systeminformation')

async function systemInformation () {
  const system = await si.system()
  const bios = await si.bios()
  const baseboard = await si.baseboard()
  const cpu = await si.cpu()
  const osInfo = await si.osInfo()
  const mem = await si.mem()
  const diskLayout = await si.diskLayout()

  return {
    system: {
      manufacturer: system.manufacturer,
      model: system.model,
      version: system.version,
      serial: system.serial,
      uuid: system.uuid,
      sku: system.sku
    },
    bios: {
      vendor: bios.vendor,
      version: bios.version,
      releaseDate: bios.releaseDate,
      revision: bios.revision
    },
    baseboard: {
      manufacturer: baseboard.manufacturer,
      model: baseboard.model,
      version: baseboard.version,
      serial: baseboard.serial,
      assetTag: baseboard.assetTag
    },
    cpu: {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      speed: cpu.speed,
      cores: cpu.cores
    },
    os: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      kernel: osInfo.kernel,
      arch: osInfo.arch,
      codepage: osInfo.codepage,
      logofile: osInfo.logofile
    },
    memory: {
      total: mem.total
    },
    diskLayout: diskLayout.map(disk => ({
      device: disk.device,
      type: disk.type,
      name: disk.name,
      vendor: disk.vendor,
      size: disk.size,
      serialNum: disk.serialNum
    }))
  }
}

module.exports = systemInformation
