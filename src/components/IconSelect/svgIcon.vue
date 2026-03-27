<template>
  <svg :class="svgClass" :style="iconStyle" aria-hidden="true">
    <use :xlink:href="iconName" :fill="color"></use>
  </svg>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: { type: String, default: "" },
});

const iconName = computed(() => {
  // console.log("iconName", `#icon-${props.name}`);
  return `#icon-${props.name}`;
});

const iconStyle = computed(() => ({ color: props.color }));

const svgClass = computed(() => {
  if (props.name) return `svg-icon icon-${props.name}`;
  return "svg-icon";
});
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 8px;
  height: 8px;
  // vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
