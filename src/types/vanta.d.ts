declare module "vanta/src/vanta.waves" {
  interface VantaEffect {
    destroy: () => void
  }

  interface VantaConfig {
    el: HTMLElement
    THREE: any
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    minHeight?: number
    minWidth?: number
    scale?: number
    scaleMobile?: number
    color?: number
    shininess?: number
    waveHeight?: number
    waveSpeed?: number
    zoom?: number
  }

  function WAVES(config: VantaConfig): VantaEffect

  export default WAVES
}
