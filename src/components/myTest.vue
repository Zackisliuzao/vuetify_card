<template>
    <v-row>
        <v-col>
            <h1>这是一个测试页面</h1>
        </v-col>
    </v-row>
    <v-row class=wrapper>
        <v-col class=wrapper>
            <div class="box1">One</div>
            <div class="box2">Two</div>
            <div class="box3">Three</div>
        </v-col>
    </v-row>
    <v-row>
        <v-col class='wrapper1' cols="auto">
            <div class="box"></div>
        </v-col>
    </v-row>
    <v-row>
        <v-col>
            <v-treeview :items="items" item-key="id" item-text="title" open-on-click>
                <!-- prepend 插槽 - 在节点文本前添加内容 -->
                <template #prepend="{ item, isOpen }">
                    <v-icon v-if="item.children" color="amber">
                        {{ isOpen ? 'mdi-folder-open' : 'mdi-folder' }}
                    </v-icon>
                    <v-icon v-else color="blue">
                        mdi-file-document
                    </v-icon>
                </template>

                <!-- append 插槽 - 在节点文本后添加内容 -->
                <template #append="{ item }">
                    <!-- <v-chip v-if="item.size" small>
                        {{ item.size }}
                    </v-chip> -->
                    <v-chip v-if="item.children && item.children.length" small>
                        {{ item.children.length }}
                    </v-chip>
                    <v-chip v-else-if="item.size" small>
                        {{ item.size }}
                    </v-chip>
                </template>

                <!-- label 插槽 - 自定义整个标签内容 -->
                <template #subtitle="{ item }">
                    <!-- <span class="font-weight-medium">{{ item.title }}</span> -->
                    <v-tooltip v-if="item.description" bottom>
                        <template #activator="{ props }">
                            <v-icon v-bind="props" small class="ml-2">
                                mdi-information
                            </v-icon>
                        </template>
                        <span>{{ item.description }}</span>
                    </v-tooltip>
                </template>
            </v-treeview>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">

const items = ref([
    {
        id: 1,
        title: '项目根目录',
        description: '项目的主要目录',
        size: '',
        children: [
            {
                id: 2,
                title: 'src',
                description: '源代码目录',
                children: [
                    { id: 3, title: 'components', size: '2.4MB' },
                    { id: 4, title: 'views', size: '1.8MB' },
                    { id: 5, title: 'assets', size: '512KB' }
                ]
            },
            {
                id: 6,
                title: 'public',
                description: '公共资源目录',
                size: '3.2MB'
            },
            {
                id: 7,
                title: 'package.json',
                description: '项目配置文件',
                size: '2.1KB'
            }
        ]
    }
])


</script>

<style scoped>
.wrapper {
    display: flex;
    justify-content: space-around;
}

.wrapper1 {
    position: relative;
    background-color: blueviolet;
    width: 100%;
    height: 500px;
}

.wrapper1 .box {
    position: absolute;
    background-color: rgb(31, 182, 89);
    width: 100px;
    height: 100px;
    right: 5%;
    bottom: 5%;
}

.wrapper1 .box:hover {
    background-color: black;
}
</style>