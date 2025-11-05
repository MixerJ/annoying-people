<script>
  import { createEventDispatcher } from 'svelte';
  
  export let angerLevel = 5;
  
  const dispatch = createEventDispatcher();
  
  const levelDescriptions = {
    1: '轻微不满',
    2: '有点不满',
    3: '不太喜欢',
    4: '有点讨厌',
    5: '比较讨厌',
    6: '相当讨厌',
    7: '非常讨厌',
    8: '极度厌恶',
    9: '深恶痛绝',
    10: '恨之入骨'
  };
  
  function handleInput(event) {
    angerLevel = parseInt(event.target.value);
    dispatch('levelChanged', angerLevel);
  }
  
  function getColorClass(level) {
    if (level <= 3) return 'from-green-500 to-yellow-500';
    if (level <= 6) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between mb-2">
    <span class="text-sm text-gray-400">愤怒程度</span>
    <span class="text-2xl font-bold bg-gradient-to-r {getColorClass(angerLevel)} bg-clip-text text-transparent">
      {angerLevel} / 10
    </span>
  </div>
  
  <input
    type="range"
    min="1"
    max="10"
    bind:value={angerLevel}
    on:input={handleInput}
    class="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer 
           accent-orange-500 slider"
  />
  
  <div class="flex justify-between text-xs text-gray-500">
    <span>1</span>
    <span>10</span>
  </div>
  
  <div class="p-4 bg-gray-700/50 rounded-lg">
    <p class="text-sm text-gray-400 mb-1">当前程度:</p>
    <p class="text-lg font-semibold text-orange-400">
      {levelDescriptions[angerLevel] || '未知'}
    </p>
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ef4444);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ef4444);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
</style>

