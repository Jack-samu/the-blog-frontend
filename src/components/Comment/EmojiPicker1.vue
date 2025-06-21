<template>
  <div>
    <el-button @click="togglePicker" ref="triggerBtn">
      <slot>
        <!-- 默认图标 -->
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zM4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z"/>
        </svg>
      </slot>
    </el-button>

    <div 
      v-show="visible" 
      ref="pickerContainer"
      :style="containerStyle"
      class="emoji-picker-container"
    >
      <Picker 
        :data="emojiIndex"
        :emojiSize="18"
        :showPreview="false"
        :infiniteScroll="false"
        :i18n="emojiI18n"
        set="twitter"
        @select="handleSelect"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import data from "emoji-mart-vue-fast/data/all.json";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src";
import "emoji-mart-vue-fast/css/emoji-mart.css";

const props = defineProps({
  // 可以自定义按钮位置偏移
  offsetX: {
    type: Number,
    default: -160
  },
  offsetY: {
    type: Number,
    default: 4
  }
});

const emit = defineEmits(['select']);

const visible = ref(false);
const triggerBtn = ref(null);
const pickerContainer = ref(null);
const pickerHeight = ref(350); // 默认高度，会在mounted时更新

const emojiIndex = new EmojiIndex(data);
const emojiI18n = {
  search: '搜索',
  notfound: 'No Emoji Found',
  categories: {
    search: '搜索结果',
    recent: '常用',
    smileys: '情感',
    people: '人物',
    nature: '动物',
    foods: '食物',
    activity: '活动',
    places: '地理',
    objects: '物品',
    symbols: '符号',
    flags: '标志',
    custom: '习俗',
    joy: '乐趣'
  }
};

const containerStyle = ref({
  position: 'fixed',
  zIndex: 9999,
  transition: 'opacity 0.2s ease',
  pointerEvents: 'auto',
  overflow: 'hidden',
  willChange: 'transform',
  transform: 'translateZ(0)'
});

// 预计算Picker高度
onMounted(async () => {
  visible.value = true;
  await nextTick();
  if (pickerContainer.value) {
    pickerHeight.value = pickerContainer.value.clientHeight + 10;
  }
  visible.value = false;
});

const updatePosition = () => {
  if (!visible.value || !triggerBtn.value) return;

  const btnRect = triggerBtn.value.$el.getBoundingClientRect();
  const spaceNeeded = btnRect.bottom + pickerHeight.value - window.innerHeight;

  // 自动滚动确保Picker可见
  if (spaceNeeded > 0) {
    window.scrollBy({
      top: spaceNeeded + 10,
      behavior: 'instant'
    });
  }

  // 更新Picker位置
  containerStyle.value = {
    ...containerStyle.value,
    top: `${btnRect.bottom + props.offsetY}px`,
    left: `${btnRect.left + props.offsetX}px`
  };
};

const togglePicker = async () => {
  visible.value = !visible.value;
  if (visible.value) {
    await nextTick();
    updatePosition();
  }
};

const handleSelect = (emoji) => {
  emit('select', emoji);
  visible.value = false;
};

// 点击外部关闭
onClickOutside(pickerContainer, () => {
  visible.value = false;
});

// 滚动时更新位置
window.addEventListener('scroll', updatePosition, { passive: true });

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updatePosition);
});
</script>

<style>
.emoji-picker-container {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>