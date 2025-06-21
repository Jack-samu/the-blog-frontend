<!-- TocTree.vue -->
<template>
  <div>
    <ul class="toc-list">
      <li 
        v-for="item in treeData" 
        :key="item.id"
        :class="`toc-level-${item.level}`"
      >
        <!-- 标题链接 -->
        <a 
          :href="`#${item.id}`" 
          class="toc-link"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.text }}
        </a>

        <!-- 递归渲染子节点 -->
        <toc-tree 
          v-if="item.children?.length"
          :tree-data="item.children"
        />
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  treeData: {
    type: Array,
    required: true
  }
})

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80 // 根据实际导航栏高度调整
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
</script>

<style scoped>
.toc-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.toc-link {
  display: block;
  padding: 6px 12px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
}

.toc-link:hover {
  background: #f5f5f5;
  color: #333;
}

/* 层级缩进 */
.toc-level-2 { padding-left: 0; }
.toc-level-3 { padding-left: 16px; }
.toc-level-4 { padding-left: 32px; }
.toc-level-5 { padding-left: 48px; }
</style>