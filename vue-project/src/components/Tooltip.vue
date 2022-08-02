<template>
  <el-popover
    placement="top"
    :width="width"
    trigger="hover"
  >
    <template #reference>
      <el-icon class="tooltip__icon" :size="iconSize"><QuestionFilled/></el-icon>
    </template>
    <template #default>
      <slot name="text"/>
    </template>
  </el-popover>
</template>

<script setup>
import { QuestionFilled } from "@element-plus/icons-vue";

defineProps({
  width: {
    type: Number,
    default: 300
  },
  iconSize: {
    type: Number,
    default: 20
  }
});
</script>

<style lang="scss">
.tooltip {
  &__icon {
    margin-left: 4px;
  }
}
</style>
