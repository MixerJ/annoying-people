<script>
  import { createEventDispatcher } from 'svelte';
  
  export let names = [];
  
  const dispatch = createEventDispatcher();
  
  function selectRandom() {
    if (names.length === 0) {
      console.warn('NameSelector: names 数组为空');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * names.length);
    const selectedName = names[randomIndex];
    console.log('NameSelector: 随机选择，索引:', randomIndex, '人名:', selectedName);
    dispatch('nameSelected', selectedName);
    console.log('NameSelector: 事件已发送');
  }
  
  function selectName(name) {
    console.log('NameSelector: 选择人名:', name);
    dispatch('nameSelected', name);
  }
</script>

<div class="space-y-4">
  <button
    on:click={selectRandom}
    class="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 
           text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
  >
    🎲 随机选择
  </button>
  
  {#if names.length > 0}
    <div class="max-h-64 overflow-y-auto">
      <p class="text-sm text-gray-400 mb-2">或从列表中选择:</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each names as name}
          <button
            on:click={() => selectName(name)}
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg 
                   transition-colors text-sm truncate"
          >
            {name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

