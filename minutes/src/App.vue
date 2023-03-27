<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="mainContainer">
    <RouterView />
  </div>
</template>

<style scoped>
  .mainContainer {
    margin: 50px;
    padding: 25px;
    border: 1px solid gray;
    border-radius: 25px;
    background-color: #f0f2f5;
  }
</style>
