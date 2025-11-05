<script>
  import FileUpload from './components/FileUpload.svelte';
  import NameSelector from './components/NameSelector.svelte';
  import AngerLevelInput from './components/AngerLevelInput.svelte';
  import ContentGenerator from './components/ContentGenerator.svelte';
  
  let names = [];
  let selectedName = '';
  let angerLevel = 5;
  
  // 调试：监听 names 数组的变化
  $: if (names.length > 0) {
    console.log('App: names 数组已更新，长度:', names.length, '内容:', names);
  }
  
  function handleNamesLoaded(event) {
    console.log('App: 收到事件对象:', event);
    console.log('App: event.detail:', event.detail);
    console.log('App: event.type:', event.type);
    
    // 从事件对象中提取数据
    const loadedNames = event.detail;
    console.log('App: 提取的人名数据:', loadedNames);
    
    if (!loadedNames) {
      console.error('App: 事件数据为空！');
      return;
    }
    
    // 确保是数组
    const namesArray = Array.isArray(loadedNames) ? loadedNames : [loadedNames];
    console.log('App: 处理后的数组，长度:', namesArray.length, '内容:', namesArray);
    
    // 强制响应式更新 - 直接赋值
    names = namesArray;
    console.log('App: 最终设置的人名数组，长度:', names.length);
  }
  
  function handleNameSelected(event) {
    console.log('App: 收到 nameSelected 事件:', event);
    const name = event.detail || event;
    console.log('App: 提取的人名:', name);
    selectedName = name;
    console.log('App: 设置 selectedName:', selectedName);
  }
  
  function handleAngerLevelChanged(level) {
    angerLevel = level;
  }
</script>

<main class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
        随机人名辱骂生成器
      </h1>
      <p class="text-gray-400">上传人名列表，根据愤怒程度生成相应语句</p>
    </header>

    <div class="space-y-6">
      <!-- 文件上传 -->
      <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
        <h2 class="text-xl font-semibold mb-4">1. 上传人名列表</h2>
        <FileUpload 
          on:namesLoaded={handleNamesLoaded}
          handleNamesLoaded={(loadedNames) => {
            console.log('通过回调函数收到数据:', loadedNames);
            names = Array.isArray(loadedNames) ? loadedNames : [loadedNames];
            console.log('通过回调函数设置 names，长度:', names.length);
          }}
        />
        {#if names.length > 0}
          <div class="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <p class="text-sm text-green-300 mb-2">
              ✅ 已加载 {names.length} 个人名
            </p>
            <p class="text-xs text-gray-400">预览: {names.slice(0, 5).join(', ')}{names.length > 5 ? '...' : ''}</p>
          </div>
        {/if}
      </div>

      <!-- 随机选择人名 -->
      {#if names.length > 0}
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-semibold mb-4">2. 选择目标</h2>
          <NameSelector {names} on:nameSelected={handleNameSelected} />
          {#if selectedName}
            <div class="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <p class="text-sm text-gray-400 mb-1">当前选择:</p>
              <p class="text-xl font-bold text-orange-400">{selectedName}</p>
            </div>
          {/if}
        </div>
      {/if}

      <!-- 愤怒程度输入 -->
      {#if selectedName}
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-semibold mb-4">3. 设置愤怒程度</h2>
          <AngerLevelInput bind:angerLevel={angerLevel} onLevelChanged={handleAngerLevelChanged} />
        </div>
      {/if}

      <!-- AI 生成 -->
      {#if selectedName && angerLevel}
        <div class="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h2 class="text-xl font-semibold mb-4">4. 生成内容</h2>
          <ContentGenerator name={selectedName} angerLevel={angerLevel} />
        </div>
      {/if}
    </div>
  </div>
</main>

