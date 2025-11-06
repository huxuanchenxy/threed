<!-- src/App.vue -->
<template>
  <GlbViewer
    url="/models/kuma_heavy_robot_r-9000s.glb"
    :autoplay="true"
    background="#222"
    style="width:100vw;height:100vh"
  />
</template>

<script setup>
import GlbViewer from '@/components/GlbViewer.vue'
</script>