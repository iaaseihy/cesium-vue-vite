<!--
 * @Descripttion: 
 * @version: v1.0
 * @Author: CaoChaoqiang
 * @Date: 2023-07-27 16:10:52
 * @LastEditors: CaoChaoqiang
 * @LastEditTime: 2023-07-27 16:19:57
-->
<!-- <template>
    <ul>
      <li v-for="item in activeItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </template>
  
  <script>
  export default {
    data() {
      return {
        items: [
          { id: 1, name: 'Item 1', isActive: true },
          { id: 2, name: 'Item 2', isActive: false },
          { id: 3, name: 'Item 3', isActive: true },
          { id: 4, name: 'Item 4', isActive: false },
          { id: 5, name: 'Item 5', isActive: true }
        ]
      };
    },
    computed: {
      activeItems() {
        return this.items.filter(item => item.isActive);
      }
    }
  };
  </script> -->

<template>
    <ul>
      <li v-for="item in activeItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  
  export default {
    setup() {
      const items = ref([
        { id: 1, name: 'Item 1', isActive: true },
        { id: 2, name: 'Item 2', isActive: false },
        { id: 3, name: 'Item 3', isActive: true },
        { id: 4, name: 'Item 4', isActive: false },
        { id: 5, name: 'Item 5', isActive: true }
      ]);
  
      const activeItems = computed(() => {
        return items.value.filter(item => item.isActive);
      });
  
      return {
        activeItems
      };
    }
  };
  </script>
  