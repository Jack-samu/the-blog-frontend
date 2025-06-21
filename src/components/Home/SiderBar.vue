<template>
    <div>
        <el-card class="person-intro">
            <el-avatar :src="avatarSrc" :size="200" fit="cover" />
            <h1 class="name">Gemini</h1>
            <p class="description">Gemini 的个人介绍！</p>
        </el-card>
        <el-card>
            <el-calendar :model="date" />
        </el-card>
        <el-card>
            <p style="text-align: center;">本站工作号</p>
            <div class="bb-box">
                <div class="box">
                    <img :src="qrCodeSrc" alt="二维码" class="qr-code" style="width: 160px;" />
                </div>
                <div class="bb">
                    <h3>渐行渐远渐无书</h3>
                    <h3>博览群家终成一家之言</h3>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import avatarSrc from '../../assets/takashi.jpg'
import qrCodeSrc from '../../assets/公众号.jpg'
import {ref} from 'vue'

const date = ref(new Date())
</script>

<style scoped>
.el-card {
    margin: 10px 0;
}

.person-intro {
    margin: auto;
    /* 居中对齐 */
    text-align: center;
    padding: 20px;
    /* 内边距 */
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    /* 背景色 */
}

.person-intro el-avatar {
    width: 80px;
    /* 头像宽度 */
    height: 80px;
    /* 头像高度 */
    margin-bottom: 10px;
    /* 头像与文本之间的间距 */
}

.name {
    font-size: 24px;
    /* 姓名字体大小 */
    margin: 10px 0;
    /* 姓名上下间距 */
}

.description {
    color: #666;
    /* 描述文本颜色 */
    font-size: 14px;
    /* 描述字体大小 */
}

.bb-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-radius: 10px;
    background-color: antiquewhite;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    /* 海报的最大宽度 */
    margin: auto;
    /* 居中对齐 */
}

.box {
    position: relative;
}

.bb {
    font-family: "楷体";
}
</style>