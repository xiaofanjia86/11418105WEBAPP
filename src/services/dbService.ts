/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  Timestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { Pet, UserProfile, AdoptionApplication } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

// 實作符合 Firebase 技能規範的詳細錯誤控制
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: getOrInitializeVisitorUid(),
      email: "visitor@langaiyoujia.org",
      emailVerified: true,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 訪客 ID 快取以提供客製化個人資料體驗
export function getOrInitializeVisitorUid(): string {
  let uid = localStorage.getItem("langaiyoujia_visitor_uid");
  if (!uid) {
    uid = "visitor_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("langaiyoujia_visitor_uid", uid);
  }
  return uid;
}

// 6 隻經典預設毛孩
const initialPets: Pet[] = [
  {
    id: 'dog_moki',
    name: '墨吉 (Moki)',
    type: 'dog',
    breed: '米克斯狗狗',
    age: '3 歲',
    gender: '公',
    genderIcon: 'fa-solid fa-mars text-blue-500',
    size: '中型犬 (12kg)',
    personality: ['溫和穩重', '極度親人', '不挑食', '已會坐下'],
    status: '待認養',
    story: '在公園流浪時被救援，非常親人且性格內斂，散步時會貼著腳步走，是個體貼的守護天使。',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'
  } as any,
  {
    id: 'cat_mimi',
    name: '咪咪 (Mimi)',
    type: 'cat',
    breed: '英國短毛貓 (混)',
    age: '1 歲 2 個月',
    gender: '母',
    genderIcon: 'fa-solid fa-venus text-pink-500',
    size: '小型貓 (3.8kg)',
    personality: ['傲嬌慢熱', '喜歡摸摸', '愛乾淨', '不愛叫'],
    status: '待認養',
    story: '被愛心人士於大雨中發現。剛開始有點害羞，熟識後會主動靠過來發出舒服的呼嚕聲。',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600'
  } as any,
  {
    id: 'dog_latte',
    name: '拿鐵 (Latte)',
    type: 'dog',
    breed: '黃金獵犬 (混)',
    age: '4 個月',
    gender: '公',
    genderIcon: 'fa-solid fa-mars text-blue-500',
    size: '幼犬 (未來中大型)',
    personality: ['活潑過動', '熱情好奇', '愛玩球', '親狗親人'],
    status: '待認養',
    story: '充滿能量的陽光大男孩，對世界上任何事物都充滿新鮮感，非常適合喜歡戶外運動的家庭！',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600'
  } as any,
  {
    id: 'cat_pudding',
    name: '布丁 (Pudding)',
    type: 'cat',
    breed: '橘貓 (Mix)',
    age: '8 個月',
    gender: '母',
    genderIcon: 'fa-solid fa-venus text-pink-500',
    size: '中型貓 (4.2kg)',
    personality: ['超級吃貨', '好奇心旺盛', '親人黏人', '呼嚕製造機'],
    status: '待認養',
    story: '十隻橘貓九隻胖！布丁是標準的橘貓，一有食物就會喵喵撒嬌。最喜歡躺在人的腿上睡覺。',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600'
  } as any,
  {
    id: 'dog_cookie',
    name: '曲奇 (Cookie)',
    type: 'dog',
    breed: '邊境牧羊犬 (混)',
    age: '2 歲',
    gender: '母',
    genderIcon: 'fa-solid fa-venus text-pink-500',
    size: '中型犬 (14kg)',
    personality: ['極度聰明', '學習力強', '敏捷活潑', '守秩序'],
    status: '待認養',
    story: '智商非常高的毛孩，很快就能聽懂各種指令。需要較多腦力激盪玩具，與足夠運動空間的家庭。',
    imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=600'
  } as any,
  {
    id: 'cat_snow',
    name: '小雪 (Snow)',
    type: 'cat',
    breed: '臨摹美短貓 (Mix)',
    age: '5 歲',
    gender: '母',
    genderIcon: 'fa-solid fa-venus text-pink-500',
    size: '中型貓 (4.5kg)',
    personality: ['安靜乖巧', '佛系性格', '優雅端莊', '愛發呆'],
    status: '待認養',
    story: '小雪是隻成熟、安靜的大貓。不吵不鬧，非常適合公寓生活或居家辦公者的溫馨陪伴者。',
    imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600'
  } as any
];

/**
 * 取得寵物清單（串接 Firestore）
 * 如果 Firestore 內完全沒有資料，則會將原始的 6 隻預設毛孩寫入作為啟始資料
 */
export async function getPets(): Promise<Pet[]> {
  const path = "pets";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    if (querySnapshot.empty) {
      console.log("Firestore pets 集合為空，正在匯入種子資料...");
      for (const pet of initialPets) {
        await setDoc(doc(db, path, pet.id), pet);
      }
      return initialPets;
    }
    
    const petsList: Pet[] = [];
    querySnapshot.forEach((docSnap) => {
      petsList.push(docSnap.data() as Pet);
    });
    return petsList;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * 送出認養申請（寫入 Firestore）
 */
export async function saveApplication(appData: Omit<AdoptionApplication, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const path = "applications";
  try {
    const docRef = await addDoc(collection(db, path), {
      ...appData,
      status: "審核中",
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * 取得當前使用者的所有認養申請記錄（串接 Firestore）
 */
export async function getApplications(adopterPhone: string): Promise<AdoptionApplication[]> {
  const path = "applications";
  try {
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const results: AdoptionApplication[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // 根據手機號碼進行過濾，展示屬於當前填寫者的資料，這樣能更有隱私與針對性
      if (data.adopterPhone === adopterPhone) {
        results.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date()
        } as AdoptionApplication);
      }
    });
    return results;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * 儲存或更新使用者的個人資料（串接 Firestore）
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `user_profiles`;
  try {
    await setDoc(doc(db, path, profile.uid), {
      ...profile,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${path}/${profile.uid}`);
  }
}

/**
 * 取得使用者的個人資料（串接 Firestore）
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `user_profiles`;
  try {
    const docSnap = await getDoc(doc(db, path, uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, `${path}/${uid}`);
  }
}
