import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { MAIN_SERVER } from "../config";

export const ItemContext = createContext();

export const ItemProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const BASE_URL = MAIN_SERVER; // ✅ 맥 Node 서버로

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items`);

      const mappedList = response.data.map((dbItem) => ({
        id: dbItem.item_id,
        title: dbItem.name,
        date: dbItem.created_at ? dbItem.created_at.split("T")[0] : "",
        image: dbItem.image_url ? `${BASE_URL}${dbItem.image_url}` : null,
        status: dbItem.status || "보관중",
      }));

      setItems(mappedList);
    } catch (error) {
      console.error("목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const getItemDetail = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/items/${id}`);
      const data = response.data;

      return {
        id: data.item_id,
        title: data.name,
        date: data.found_date ? data.found_date.split("T")[0] : "",
        location: `${data.address || ""} ${data.detail_address || ""}`.trim(),
        category: data.category_name || "기타",
        desc: data.description || "",
        image: data.image_url ? `${BASE_URL}${data.image_url}` : null,
        status: data.status || "보관중",
      };
    } catch (error) {
      console.error("상세 정보 로드 실패:", error);
      return null;
    }
  };

  // ItemContext.js 중 addItem 함수 내부만 교체
const addItem = async (inputs, imageFile) => {
  try {
    const formData = new FormData();

    // ✅ found_date 안전하게 보정 (YYYY-MM-DD)
    const foundDate =
      inputs?.date ||
      inputs?.found_date ||
      new Date().toISOString().slice(0, 10);

    formData.append("name", inputs.title);
    formData.append("description", inputs.desc || "");
    formData.append("found_date", foundDate); // ✅ 여기 절대 undefined 안 됨

    const categoryMap = {
      "전자기기": 1,
      "지갑": 2,
      "지갑/카드": 2,
      "가방": 3,
      "의류": 4,
      "기타": 5,
    };
    formData.append("category_id", categoryMap[inputs.category] || 5);

    let placeId = 1;
    if (inputs.location?.includes("학생")) placeId = 2;
    else if (inputs.location?.includes("도서")) placeId = 3;
    formData.append("place_id", placeId);

    if (imageFile) formData.append("image", imageFile);

    await axios.post(`${BASE_URL}/api/items`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 20000,
    });

    await fetchItems();
    return true;
  } catch (error) {
    console.error("등록 실패:", error);
    alert(`등록 실패: ${error.response?.data?.error || error.message}`);
    return false;
  }
};

  return (
    <ItemContext.Provider value={{ items, fetchItems, getItemDetail, addItem, BASE_URL }}>
      {children}
    </ItemContext.Provider>
  );
};