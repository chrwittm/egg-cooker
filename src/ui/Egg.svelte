<script lang="ts">
  import type { Illustration } from '../domain/egg';
  let { frame }: { frame: Illustration } = $props();
  const id = $props.id();
  const eggPath =
    'M120 14C78 14 29 98 29 156C29 214 68 244 120 244C172 244 211 214 211 156C211 98 162 14 120 14Z';
</script>

<div
  class="egg-art"
  role="img"
  aria-label={`Illustrated progress, not a measurement inside the egg. ${frame.stage}`}
  data-white={frame.white.toFixed(4)}
  data-yolk={frame.yolk.toFixed(4)}
>
  <svg viewBox="0 0 240 264" aria-hidden="true">
    <defs>
      <clipPath id={`${id}-shell`}><path d={eggPath} /></clipPath>
      <radialGradient id={`${id}-raw`} cx="35%" cy="25%"
        ><stop stop-color="#d9c39a" /><stop
          offset="1"
          stop-color="#bca47a"
        /></radialGradient
      >
      <radialGradient id={`${id}-yolk`} cx="32%" cy="28%"
        ><stop stop-color="#ffba39" /><stop
          offset="0.6"
          stop-color="#ee8b10"
        /><stop offset="1" stop-color="#d46a09" /></radialGradient
      >
    </defs>
    <ellipse cx="120" cy="254" rx="63" ry="6" fill="#49351c" opacity=".09" />
    <path d={eggPath} fill="#fffdf4" />
    <g clip-path={`url(#${id}-shell)`}>
      <path
        d={eggPath}
        fill={`url(#${id}-raw)`}
        transform={`translate(120 140) scale(${1 - frame.white * 0.64}) translate(-120 -140)`}
        opacity={1 - frame.white}
      />
      <circle
        cx="120"
        cy="151"
        r="58"
        fill="#ecac32"
        stroke="#ce851a"
        stroke-width="1.5"
      />
      <circle
        cx="120"
        cy="151"
        r={58 * Math.sqrt(1 - frame.yolk)}
        fill={`url(#${id}-yolk)`}
      />
      <ellipse
        cx={120 - 18 * Math.sqrt(1 - frame.yolk)}
        cy={151 - 23 * Math.sqrt(1 - frame.yolk)}
        rx={18 * Math.sqrt(1 - frame.yolk)}
        ry={9 * Math.sqrt(1 - frame.yolk)}
        transform="rotate(-28 102 128)"
        fill="#fff8cd"
        opacity={0.68 * (1 - frame.yolk)}
      />
    </g>
    <path d={eggPath} fill="none" stroke="#483821" stroke-width="3" />
    <path
      d={eggPath}
      fill="none"
      stroke="#e6d8bd"
      stroke-width="5"
      transform="translate(120 130) scale(.966) translate(-120 -130)"
    />
  </svg>
</div>
