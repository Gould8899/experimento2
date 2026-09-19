<template>
  <svg
    ref="svgEl"
    :class="['keyboard', { 'keyboard--real': mode === 'real' }]"
    :viewBox="viewBox"
    preserveAspectRatio="xMidYMid meet"
  >
    <g :transform="contentTransform">
      <slot />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    side?: 'left' | 'right';
    mode?: 'real' | 'flat';
  }>(),
  {
    side: 'right',
    mode: 'real',
  },
);

const landscapeWidth = 690;
const landscapeHeight = 410;

const svgEl = ref<SVGSVGElement | null>(null);

const viewBox = computed(() => {
  if (props.mode === 'flat') return `0 0 ${landscapeWidth} ${landscapeHeight}`;
  return `0 0 ${landscapeHeight} ${landscapeWidth}`;
});

const contentTransform = computed(() => {
  if (props.mode === 'flat') return undefined;

  if (props.side === 'left') {
    return `translate(0 ${landscapeWidth}) rotate(-90)`;
  }

  return `translate(${landscapeHeight} 0) rotate(90)`;
});

function pdfCompatibleColor(value: string) {
  if (!value.startsWith('oklch(')) return value;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return value;

  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `rgb(${red} ${green} ${blue})`;
}

type PdfLabel = {
  color: [number, number, number];
  fontSize: number;
  text: string;
  x: number;
  y: number;
};

function pdfColor(value: string): [number, number, number] {
  const channels = pdfCompatibleColor(value).match(/\d+/g)?.map(Number);
  if (!channels || channels.length < 3) return [0, 0, 0];
  return [channels[0]!, channels[1]!, channels[2]!];
}

function solfegeLabel(value: string) {
  const match = value.match(/^([A-G])([#b]?)(\d+)$/);
  if (!match) return value.replace(/♯/g, '#').replace(/♭/g, 'b');

  const names: Record<string, string> = {
    A: 'La',
    B: 'Si',
    C: 'Do',
    D: 'Re',
    E: 'Mi',
    F: 'Fa',
    G: 'Sol',
  };
  return `${names[match[1]!]}${match[2]}${match[3]}`;
}

function exportPoint(x: number, y: number) {
  if (props.mode === 'flat') return { x, y };
  if (props.side === 'left') return { x: y, y: landscapeWidth - x };
  return { x: landscapeHeight - y, y: x };
}

function collectPdfLabels(): PdfLabel[] {
  if (!svgEl.value) return [];

  return Array.from(svgEl.value.querySelectorAll('text')).map((text) => {
    const circle = Array.from(text.parentElement?.querySelectorAll('circle') ?? [])
      .find((candidate) => candidate.getAttribute('fill') !== 'none');
    const style = window.getComputedStyle(text);
    const centerX = Number(circle?.getAttribute('cx') ?? text.getAttribute('x'));
    const centerY = Number(circle?.getAttribute('cy') ?? text.getAttribute('y'));
    const point = exportPoint(
      centerX,
      centerY,
    );

    return {
      color: pdfColor(style.fill),
      fontSize: Number.parseFloat(style.fontSize),
      text: solfegeLabel(text.textContent ?? ''),
      x: point.x,
      y: point.y,
    };
  });
}

function inlineComputedStyles(source: Element, target: SVGElement) {
  const style = window.getComputedStyle(source);
  for (let index = 0; index < style.length; index += 1) {
    const property = style[index];
    target.style.setProperty(
      property,
      style.getPropertyValue(property),
      style.getPropertyPriority(property),
    );
  }

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children[index] as SVGElement | undefined;
    if (targetChild) inlineComputedStyles(sourceChild, targetChild);
  });
}

function inlineVectorStyles(source: Element, target: SVGElement) {
  const style = window.getComputedStyle(source);
  const properties = [
    'color',
    'fill',
    'stroke',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-dasharray',
    'opacity',
    'font-size',
    'font-weight',
    'text-anchor',
  ];

  properties.forEach((property) => {
    const value = style.getPropertyValue(property);
    if (value) {
      const compatibleValue = ['color', 'fill', 'stroke'].includes(property)
        ? pdfCompatibleColor(value)
        : value;
      target.setAttribute(property, compatibleValue);
    }
  });

  if (target instanceof SVGTextElement || target instanceof SVGTSpanElement) {
    target.setAttribute('font-family', 'Helvetica');
  }

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children[index] as SVGElement | undefined;
    if (targetChild) inlineVectorStyles(sourceChild, targetChild);
  });
}

const prepareExportSvg = (forVectorPdf = false) => {
  if (!svgEl.value) return null;

  const exportWidth = props.mode === 'flat' ? landscapeWidth : landscapeHeight;
  const exportHeight = props.mode === 'flat' ? landscapeHeight : landscapeWidth;
  const exportSvg = svgEl.value.cloneNode(true) as SVGSVGElement;
  exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  exportSvg.setAttribute('width', String(exportWidth));
  exportSvg.setAttribute('height', String(exportHeight));
  Array.from(svgEl.value.children).forEach((sourceChild, index) => {
    const targetChild = exportSvg.children[index] as SVGElement | undefined;
    if (!targetChild) return;

    if (forVectorPdf) {
      inlineVectorStyles(sourceChild, targetChild);
    } else {
      inlineComputedStyles(sourceChild, targetChild);
    }
  });
  if (forVectorPdf) {
    exportSvg.querySelectorAll('text, tspan').forEach((element) => {
      element.childNodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        node.textContent = node.textContent
          ?.replace(/♯/g, '#')
          .replace(/♭/g, 'b') ?? null;
      });
    });
  }

  return { exportHeight, exportSvg, exportWidth };
};

const download = (filename: string) => {
  // https://mybyways.com/blog/convert-svg-to-png-using-your-browser

  const exportData = prepareExportSvg();
  if (!exportData) return;

  const margin = 30;
  const exportScale = 2;
  const exportMargin = margin * exportScale;
  const canvas = document.createElement('canvas');
  canvas.width = exportData.exportWidth * exportScale + exportMargin * 2;
  canvas.height = exportData.exportHeight * exportScale + exportMargin * 2;
  const data = new XMLSerializer().serializeToString(exportData.exportSvg);
  const win = window.URL || window.webkitURL || window;
  const img = new Image();
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = win.createObjectURL(blob);

  const cleanup = () => {
    img.removeEventListener('load', onLoad);
    img.removeEventListener('error', onError);
    win.revokeObjectURL(url);
  };

  const onLoad = () => {
    cleanup();

    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      img,
      exportMargin,
      exportMargin,
      canvas.width - 2 * exportMargin,
      canvas.height - 2 * exportMargin,
    );
    win.revokeObjectURL(url);
    const uri = canvas
      .toDataURL('image/png')
      .replace('image/png', 'octet/stream');
    const a = document.createElement('a');
    document.body.append(a);
    a.style.display = 'none';
    a.href = uri;
    a.download = filename;
    a.click();
    a.remove();
  };

  const onError = () => {
    cleanup();
  };

  img.addEventListener('load', onLoad);
  img.addEventListener('error', onError);

  img.src = url;
};

const downloadSvg = (filename: string) => {
  const exportData = prepareExportSvg();
  if (!exportData) return;

  const data = new XMLSerializer().serializeToString(exportData.exportSvg);
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const downloadPdf = async (filename: string) => {
  const labels = collectPdfLabels();
  const exportData = prepareExportSvg(true);
  if (!exportData) return;

  exportData.exportSvg.querySelectorAll('text').forEach((text) => {
    text.remove();
  });

  const [{ jsPDF }, { svg2pdf }] = await Promise.all([
    import('jspdf'),
    import('svg2pdf.js'),
  ]);
  const pdf = new jsPDF({
    compress: true,
    format: [exportData.exportWidth, exportData.exportHeight],
    orientation:
      exportData.exportWidth > exportData.exportHeight ? 'landscape' : 'portrait',
    unit: 'pt',
  });

  await svg2pdf(exportData.exportSvg, pdf, {
    height: exportData.exportHeight,
    width: exportData.exportWidth,
    x: 0,
    y: 0,
  });
  labels.forEach((label) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(label.fontSize);
    pdf.setTextColor(...label.color);
    pdf.text(label.text, label.x, label.y, {
      align: 'center',
      baseline: 'middle',
    });
  });
  downloadBlob(pdf.output('blob'), filename);
};

defineExpose({ download, downloadPdf, downloadSvg });
</script>

<style scoped>
.keyboard {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-width: 100%;
  max-height: 100%;
}

.keyboard--real {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}
</style>
