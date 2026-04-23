// ==UserScript==
// @name         网页图片筛选下载
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  抓取网页图片，按像素筛选，支持单张/批量下载
// @author       悟
// @match        *://*/*
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/348766299/pic/main/pic.user.js
// @homepageURL  https://github.com/348766299/pic.user.js
// ==/UserScript==

(function() {
    'use strict';

    // 创建全局控制按钮（默认显示）
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'imageToolToggle';
    toggleBtn.style.position = 'fixed';
    toggleBtn.style.bottom = '20px';
    toggleBtn.style.right = '20px';
    toggleBtn.style.zIndex = '9998';
    toggleBtn.style.width = '40px';
    toggleBtn.style.height = '40px';
    toggleBtn.style.borderRadius = '50%';
    toggleBtn.style.backgroundColor = '#4CAF50';
    toggleBtn.style.color = 'white';
    toggleBtn.style.fontSize = '20px';
    toggleBtn.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.innerHTML = '🖼️';
    document.body.appendChild(toggleBtn);

    // 创建主面板（默认隐藏）
    const panel = document.createElement('div');
    panel.id = 'imageToolPanel';
    panel.style.position = 'fixed';
    panel.style.bottom = '70px';
    panel.style.right = '20px';
    panel.style.zIndex = '9999';
    panel.style.width = '280px';
    panel.style.backgroundColor = 'white';
    panel.style.borderRadius = '10px';
    panel.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    panel.style.overflow = 'hidden';
    panel.style.display = 'none'; // 默认隐藏
    panel.innerHTML = `
        <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 12px; color: white;">
            <h3 style="margin: 0; font-size: 16px;">图片筛选下载（增强版）</h3>
        </div>
        <div style="padding: 12px;">
            <div style="display: flex; margin-bottom: 10px;">
                <input type="number" id="minPixel" value="500" min="1"
                    style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-right: 5px;">
                <button id="fetchImages" style="padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    抓取
                </button>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <button id="selectAll" style="padding: 5px 10px; background: #E0E0E0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    全选
                </button>
                <button id="deselectAll" style="padding: 5px 10px; background: #E0E0E0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    取消全选
                </button>
            </div>
            <div style="margin-bottom: 10px;">
                <input type="text" id="renamePrefix" placeholder="输入重命名前缀"
                    style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div id="imageList" style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 5px;"></div>
            <button id="downloadAll"
                style="width: 100%; padding: 10px; margin-top: 10px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                下载全部
            </button>
        </div>
    `;
    document.body.appendChild(panel);

    let images = [];

    // 切换面板显示
    toggleBtn.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // 抓取图片
    document.getElementById('fetchImages').addEventListener('click', () => {
        images = [];
        document.getElementById('imageList').innerHTML = '';

        const minPixel = parseInt(document.getElementById('minPixel').value);
        images = Array.from(document.images).filter(img => {
            return img.naturalWidth >= minPixel && img.naturalHeight >= minPixel;
        });
        renderImageList();
    });

    // 渲染图片列表
    function renderImageList() {
        const list = document.getElementById('imageList');
        list.innerHTML = '';
        images.forEach((img, index) => {
            const item = document.createElement('div');
            item.style.padding = '8px';
            item.style.borderBottom = '1px solid #f5f5f5';
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.innerHTML = `
                <input type="checkbox" class="imageCheckbox" data-index="${index}"
                    style="margin-right: 10px; transform: scale(1.2);">
                <img src="${img.src}" width="60" style="border-radius: 4px; margin-right: 10px;">
                <div style="flex: 1; overflow: hidden;">
                    <div style="font-weight: 500; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${img.naturalWidth}×${img.naturalHeight}
                    </div>
                    <div style="color: #666; font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${img.src.split('/').pop()}
                    </div>
                </div>
            `;
            list.appendChild(item);
        });
    }

    // 全选功能
    document.getElementById('selectAll').addEventListener('click', () => {
        document.querySelectorAll('.imageCheckbox').forEach(cb => {
            cb.checked = true;
        });
    });

    // 取消全选功能
    document.getElementById('deselectAll').addEventListener('click', () => {
        document.querySelectorAll('.imageCheckbox').forEach(cb => {
            cb.checked = false;
        });
    });

    // 下载单张图片（支持重命名）
    function downloadImage(url, index) {
        const prefix = document.getElementById('renamePrefix').value.trim();
        let fileName = url.split('/').pop();

        // 如果有重命名前缀，添加序号
        if (prefix) {
            const ext = fileName.split('.').pop();
            fileName = `${prefix}_${index + 1}.${ext}`;
        }

        GM_download(url, fileName);
    }

    // 下载全部（直接调用GM_download）
    document.getElementById('downloadAll').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.imageCheckbox');
        let count = 0;

        checkboxes.forEach(cb => {
            if (cb.checked) {
                const index = cb.getAttribute('data-index');
                downloadImage(images[index].src, count);
                count++;
            }
        });
    });
})();
