<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <div class="h-full w-full flex flex-col gap-2">
    <div>
      <div>Welcome</div>
      <RouterLink to="/PrototypeOne">Play Mode 1</RouterLink> <br />
      <RouterLink to="/PrototypeTwo">Play Mode 2</RouterLink>
    </div>
    <div class="">
      <RouterView />
    </div>
  </div>
</template>
