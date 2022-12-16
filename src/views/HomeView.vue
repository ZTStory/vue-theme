<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { changeTheme } from "@/theme";

const themeList = reactive(["Light", "Dark", "Custom", "Pink"]);
onMounted(() => {
    const selectDom = document.getElementById("theme-select") as HTMLSelectElement;
    selectDom.onchange = function () {
        changeTheme(selectDom.value);
    };
});
</script>

<template>
    <div class="page_container">
        <div class="topic">Vue Theme Change</div>
        <div>
            <label for="theme-select">Current Theme:</label>
            <select name="themes" id="theme-select">
                <option v-for="(item, index) in themeList" :key="index" :value="item">{{ item }}</option>
            </select>
        </div>
    </div>
</template>

<style>
.topic {
    font-size: larger;
    color: var(--color-heading);
}
</style>
