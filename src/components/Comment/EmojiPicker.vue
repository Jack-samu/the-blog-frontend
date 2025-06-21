<!-- EmojiPicker.vue -->
<template>
  <el-popover
    placement="top-start"
    trigger="click"
    :width="300"
  >
    <template #reference>
        <el-icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
             <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zM4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z"/>
            </svg>
        </el-icon>
    </template>
    
    <el-tabs>
      <el-tab-pane label="表情">
        <Picker 
            :data="emojiIndex"
            :emojiSize="18"
            :showPreview="false"
            :infiniteScroll="false"
            :i18n="emojiI18n"
            set="twitter"
            @select="handleSelect"
        />
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<script setup>
import data from "emoji-mart-vue-fast/data/all.json"
import { Picker, EmojiIndex } from "emoji-mart-vue-fast/src"
import "emoji-mart-vue-fast/css/emoji-mart.css"


const emit = defineEmits(['select'])

const handleSelect = (emoji) => {
    emit('select', emoji.native)
}

const emojiIndex = new EmojiIndex(data)
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
}
</script>