<template>
    <div class="root-page">
        <div style="width: 100%;">
            <carousel-header style="width: 100%;" />
            <nav-header style="width: 100%;" />
            <el-alert title="欢迎来到 Gemini's Studio，系统维护将在周六进行。请及时关注！" type="success" />
        </div>
        <el-row style="flex: 1;min-height: calc(100vh-600px);" :xs="24">
            <el-col :span="17" style="padding: 20px;">
                <PostList style="width: 100%;height: 100%;"/>
            </el-col>
            <el-col :span="6" :xs="24">
                <sider-bar />
            </el-col>
        </el-row>
        <el-footer class="footer">
            Powered by Gemini.
        </el-footer>
    </div>
</template>

<script setup>
import NavHeader from '../components/Home/NavHeader.vue'
import CarouselHeader from '../components/Home/CarouselHeader.vue'
import PostList from '../components/Home/PostList.vue'
import SiderBar from '../components/Home/SiderBar.vue'
</script>

<style scoped>
.root-page{
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    width: 100%;
}
.footer {
    background-color: rgb(51.2, 126.4, 204);
    text-align: center;
    font-weight: bold;
    width: 100%;
    height: 30px;
    line-height: 30px;
}
</style>