<script>
  import { createEventDispatcher } from 'svelte';
  import * as XLSX from 'xlsx';
  
  const dispatch = createEventDispatcher();
  
  // 也支持通过 props 传递回调函数
  export let handleNamesLoaded = null;
  
  let fileInput;
  let isDragging = false;
  let error = '';
  let isLoading = false;
  
  function handleFileSelect(event) {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }
  
  function handleDragOver(event) {
    event.preventDefault();
    isDragging = true;
  }
  
  function handleDragLeave() {
    isDragging = false;
  }
  
  function handleDrop(event) {
    event.preventDefault();
    isDragging = false;
    
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  }
  
  async function processFile(file) {
    error = '';
    isLoading = true;
    console.log('开始处理文件:', file.name, file.type);
    
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isText = fileName.endsWith('.txt') || fileName.endsWith('.csv');
    
    // 检查文件类型
    const validTypes = [
      'text/plain', 
      'text/csv', 
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['.txt', '.csv', '.xlsx', '.xls'];
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => fileName.endsWith(ext));
    
    console.log('文件类型检查:', { fileName, fileType: file.type, isExcel, isText, isValidType });
    
    if (!isValidType) {
      error = '请上传 .txt、.csv 或 Excel (.xlsx/.xls) 文件';
      console.error('文件类型无效');
      isLoading = false;
      return;
    }
    
    try {
      let names = [];
      
      if (isExcel) {
        console.log('处理 Excel 文件');
        // 处理 Excel 文件
        names = await parseExcelFile(file);
        console.log('Excel 解析结果:', names);
      } else {
        console.log('处理文本文件');
        // 处理文本文件
        const text = await file.text();
        names = parseNames(text);
        console.log('文本解析结果:', names);
      }
      
      if (names.length === 0) {
        error = '文件中没有找到有效的人名';
        console.error('没有找到人名');
        isLoading = false;
        return;
      }
      
      console.log('准备发送事件，人名数量:', names.length, '人名内容:', names);
      // 确保发送的是数组的副本，触发响应式更新
      const namesToSend = [...names];
      console.log('准备发送的数据副本:', namesToSend);
      
      // 方式1: 通过事件系统
      dispatch('namesLoaded', namesToSend);
      console.log('事件已发送，数据:', namesToSend);
      
      // 方式2: 通过回调函数（如果提供）
      if (handleNamesLoaded && typeof handleNamesLoaded === 'function') {
        console.log('通过回调函数传递数据');
        handleNamesLoaded(namesToSend);
      }
      
      // 验证事件是否真的被发送
      console.log('dispatch 函数执行完成');
      isLoading = false;
    } catch (err) {
      console.error('处理文件时出错:', err);
      error = '读取文件失败: ' + (err.message || err.toString());
      isLoading = false;
    }
  }
  
  async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            console.log('Excel 文件读取完成');
            const data = new Uint8Array(e.target.result);
            console.log('开始解析 Excel，数据长度:', data.length);
            
            const workbook = XLSX.read(data, { type: 'array' });
            console.log('Excel 工作簿解析成功，工作表数量:', workbook.SheetNames.length);
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 将工作表转换为 JSON（数组格式）
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1, 
              defval: '' 
            });
            
            console.log('Excel 数据行数:', jsonData.length);
            
            // 提取所有单元格的值
            const names = [];
            for (const row of jsonData) {
              if (Array.isArray(row)) {
                for (const cell of row) {
                  // 处理字符串和数字类型
                  if (cell !== null && cell !== undefined && cell !== '') {
                    const cellValue = String(cell).trim();
                    if (cellValue.length > 0) {
                      names.push(cellValue);
                    }
                  }
                }
              }
            }
            
            console.log('提取的人名:', names);
            // 去重
            const uniqueNames = [...new Set(names)];
            console.log('去重后的人名数量:', uniqueNames.length);
            resolve(uniqueNames);
          } catch (err) {
            console.error('解析 Excel 时出错:', err);
            reject(err);
          }
        };
        
        reader.onerror = (err) => {
          console.error('读取文件时出错:', err);
          reject(new Error('读取文件失败'));
        };
        
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('创建 FileReader 时出错:', err);
        reject(err);
      }
    });
  }
  
  function parseNames(text) {
    // 按行分割，过滤空行和空白字符
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // 处理 CSV 格式（如果有逗号分隔）
    const names = [];
    for (const line of lines) {
      if (line.includes(',')) {
        const parts = line.split(',').map(part => part.trim());
        names.push(...parts.filter(part => part.length > 0));
      } else {
        names.push(line);
      }
    }
    
    // 去重
    return [...new Set(names)];
  }
  
  function clickFileInput() {
    fileInput?.click();
  }
</script>

<div class="space-y-4">
  <div
    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
           {isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-gray-500'}"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    on:click={clickFileInput}
    role="button"
    tabindex="0"
  >
    <input
      bind:this={fileInput}
      type="file"
      accept=".txt,.csv,.xlsx,.xls"
      on:change={handleFileSelect}
      class="hidden"
    />
    
    <svg
      class="w-12 h-12 mx-auto mb-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
    
    <p class="text-gray-300 mb-2">
      {#if isLoading}
        <span class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在处理文件...
        </span>
      {:else}
        <span class="text-orange-400 font-semibold">点击上传</span> 或拖放文件到这里
      {/if}
    </p>
    <p class="text-sm text-gray-500">支持 .txt、.csv 或 Excel (.xlsx/.xls) 格式</p>
  </div>
  
  {#if error}
    <div class="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
      {error}
    </div>
  {/if}
</div>

