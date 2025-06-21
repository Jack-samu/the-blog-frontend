<template>
    <div style="border-bottom: 1px solid #f0f0f0;">
        <el-form v-show="type=== 'edit'">
            <el-form-item>
                <el-input 
                 :type="typeValue" 
                 v-model="content" 
                 :rows="content ? undefined : 5" 
                 @keyup.enter="submit"
                 :maxlength="content? 400 : undefined" 
                 :show-word-limit="content ? true : false"
                 :disabled="!auth.isAuthenticated" 
                 :placeholder="!auth.isAuthenticated ? '需要登录才能进行评论' : ''"/>
            </el-form-item>
            <el-form-item>
                <div style="display: flex;justify-content: flex-end;width: 100%;">
                    <div style="margin-left: auto;display: flex;gap:4px;">
                        <el-button circle>
                            <emoji-picker ref="emojiPickerRef" @select="handleEmojiSelect" />
                        </el-button>
                        <el-button @click.native="submit" circle>
                            <el-icon>
                                <Position />
                            </el-icon>
                        </el-button>
                    </div>
                </div>
            </el-form-item>
        </el-form>

        <div class="comment-view" v-show=" type === 'view'">
            <p>{{ content }}</p>
        </div>
    </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { Position } from '@element-plus/icons-vue'
import EmojiPicker from './EmojiPicker.vue'
import { useAuthStore } from '../../stores/auth'


const auth = useAuthStore()
const emits = defineEmits(['submit-content'])

const props = defineProps({
    content: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: 'edit',
        validator: v => ['edit', 'view'].includes(v)
    },
    type: {
        type: String,
        default: 'textarea',
        validator: v => ['text', 'textarea'].includes(v)
    }
})

const content = ref('')
const type = ref('edit')
const emojiPickerRef = ref(null)
const typeValue = ref(props.type)

const switchMode = async (m) => {
    type.value = m
    await nextTick()
}

watch(() => props.content, (newContent) =>{
    content.value = newContent
}, {immediate: true})

onMounted(() => {
    content.value = props.content
    type.value = props.mode
})

const submit = () => {
    if(!content.value.trim())return
    emits('submit-content', content.value)
    content.value = props.content
    if(props.mode  === 'view') type.value = 'view'
}

const handleEmojiSelect = (emoji) => {
    content.value += emoji
}

defineExpose({
    switchMode,
    emojiPickerRef
})
</script>