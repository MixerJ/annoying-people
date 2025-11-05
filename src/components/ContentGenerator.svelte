<script>
  export let name = '';
  export let angerLevel = 5;
  
  let content = '';
  let isLoading = false;
  let error = '';
  
  async function generate() {
    isLoading = true;
    error = '';
    content = '';
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          angerLevel: angerLevel
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        content = data.content;
      } else {
        error = data.error || '生成失败，请稍后重试';
      }
    } catch (err) {
      console.error('生成错误:', err);
      if (err.message?.includes('fetch')) {
        error = '网络错误，请检查服务器连接';
      } else {
        error = '生成失败，请稍后重试';
      }
    } finally {
      isLoading = false;
    }
  }
  
  // 当人名或愤怒程度改变时，清除之前的内容
  $: if (name || angerLevel) {
    content = '';
    error = '';
  }
</script>

<div class="space-y-4">
  <button
    on:click={generate}
    disabled={isLoading}
    class="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 
           text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg
           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
  >
    {#if isLoading}
      <span class="flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        生成中...
      </span>
    {:else}
      ✨ 生成内容
    {/if}
  </button>
  
  {#if error}
    <div class="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
      {error}
    </div>
  {/if}
  
  {#if content}
    <div class="p-6 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg border border-gray-600">
      <p class="text-sm text-gray-400 mb-2">生成的内容:</p>
      <p class="text-xl font-semibold text-white leading-relaxed">
        {content}
      </p>
    </div>
  {/if}
</div>

