/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { ElMessage, ElMessageBox } from "element-plus";
import CryptoJS from 'crypto-js';


const executionStatus = (data) => {
    if (data.code == 200) {
        ElMessage.success(data.message)
    } else {
        ElMessage.error(data.message)
    }
}

const cryptoUtil = {
    // 从环境变量获取密钥原文，如果不存在则使用默认值（生产环境应确保设置环境变量）
    getKeyString() {
        // 在Vue中，可以通过import.meta.env访问环境变量
        // 环境变量命名规范：以VITE_开头的变量在构建时会被注入到import.meta.env中
        return import.meta.env.VITE_CRYPTO_SECRET_KEY || "hezhaoyuSecretKey@admin123"; // 默认值仅用于开发环境
    },

    // 加密函数 - 使用PBKDF2生成密钥并加密
    encrypt(text) {
        try {
            // 生成随机IV（16字节）
            const iv = CryptoJS.lib.WordArray.random(16);
            // 生成随机盐（16字节）
            const salt = CryptoJS.lib.WordArray.random(16);
            // 使用PBKDF2生成密钥（256位），并将盐传入
            console.log("加密密钥：", this.getKeyString());
            const secretKey = CryptoJS.PBKDF2(this.getKeyString(), salt, { keySize: 256 / 32, iterations: 1000 });
            // 使用生成的密钥进行AES加密
            const encrypted = CryptoJS.AES.encrypt(text, secretKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            // 生成与Node.js兼容的输出格式: salt:iv:encrypted
            const saltHex = salt.toString(CryptoJS.enc.Hex);
            const ivHex = iv.toString(CryptoJS.enc.Hex);
            const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
            // 返回格式: salt:iv:encrypted
            return saltHex + ':' + ivHex + ':' + encryptedHex;
        } catch (error) {
            console.error('加密失败:', error);
            throw error;
        }
    },

    // 解密函数 - 使用PBKDF2生成密钥并解密
    decrypt(encryptedText) {
        try {
            // 从加密文本中提取salt、iv和encryptedData
            const parts = encryptedText.split(':');
            if (parts.length !== 3) {
                throw new Error('无效的加密数据格式');
            }
            // 将salt和iv转换为WordArray
            const salt = CryptoJS.enc.Hex.parse(parts[0]);
            const iv = CryptoJS.enc.Hex.parse(parts[1]);
            const encrypted = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Hex.parse(parts[2])
            });
            // 使用PBKDF2生成密钥
            const secretKey = CryptoJS.PBKDF2(this.getKeyString(), salt, { keySize: 256 / 32, iterations: 1000 });
            // 使用生成的密钥解密
            const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            // 返回解密后的文本
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('解密失败:', error);
            throw error;
        }
    }
};

/**
 * 日期格式化函数 - 增强版
 * 支持 Date 对象、ISO字符串、时间戳
 */
const formatDate = (date) => {
    if (!date) return "";
    let dateObj;

    // 判断输入类型并转换为Date对象
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === "string" && date.includes("T")) {
        // ISO字符串格式，如 "2026-02-04T00:00:00.000Z"
        dateObj = new Date(date);
    } else if (typeof date === "number" || !isNaN(date)) {
        // 时间戳
        dateObj = new Date(Number(date));
    } else if (typeof date === "string") {
        // 尝试解析其他日期字符串
        dateObj = new Date(date);
    } else {
        return "";
    }

    // 验证Date对象是否有效
    if (isNaN(dateObj.getTime())) {
        return "";
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    // 格式化为YYYY-MM-DD
    return `${year}-${month}-${day}`;
};

// 处理图片上传
const imageEdit = (data) => {
    console.log(data);
    let arr = [];
    if (Array.isArray(data)) {
        data.forEach((element) => {
            if (element && element.url) {
                console.log(element);
                arr.push(element.url.split("aliyuncs.com")[1]);
            }
        });
        return arr.join(",");
    }
    return data;
};


export {
    executionStatus,
    cryptoUtil,
    formatDate,
    imageEdit
};
