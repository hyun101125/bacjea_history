# 백제 영토 변화 지도

시간에 따라 백제의 영토 변화를 시각적으로 보여주는 웹사이트입니다.

## 기능

- 🗺️ 구글/네이버 맵 스타일의 인터페이스
- ⏰ 타임라인 슬라이더로 시대별 영토 변화 확인
- 🔍 줌 인/아웃 및 팬(드래그) 기능
- 📱 모바일 세로형식 반응형 디자인
- 🖼️ 시대별 영토 이미지 지원

## 사용 방법

1. 한반도 지도 이미지를 준비하세요
   - 권장 크기: 800x1000px 이상
   - 투명 배경 PNG 또는 JPG 형식
   - 한반도 전체가 보이는 지도 이미지
   - 파일명: `hanbando.jpg` (또는 `script.js`에서 경로 수정)

2. 시대별 백제 영토 이미지를 준비하세요
   - 각 시대별로 백제 영토가 표시된 이미지
   - 한반도 지도와 동일한 크기 및 비율 권장
   - 투명 배경 PNG 권장 (영토만 표시)
   - 파일명 예시: `territory-18bc.png`, `territory-300.png` 등

3. `script.js` 파일에서 영토 이미지 경로 설정
   - 각 시대의 `territoryImage` 필드에 이미지 파일 경로 입력
   - 예: `territoryImage: 'territory-18bc.png'`

4. `index.html` 파일을 웹 브라우저에서 열기

## 영토 이미지 설정 방법

### 방법 1: 이미지 파일 사용 (권장)

`script.js` 파일의 각 시대 데이터에 `territoryImage` 필드를 추가하세요:

```javascript
{
    year: -18,
    title: "백제 건국",
    description: "...",
    territoryImage: 'territory-18bc.png',  // 이미지 파일 경로
    territory: []  // 이미지를 사용하면 비워둠
}
```

### 방법 2: SVG Path 사용 (이미지가 없을 경우)

이미지 파일이 없으면 SVG path로 영토를 그릴 수 있습니다:

```javascript
{
    year: -18,
    title: "백제 건국",
    description: "...",
    territoryImage: '',  // 비워둠
    territory: [
        { 
            type: 'path', 
            path: 'M 45,35 L 55,35 L 55,43 L 45,43 Z' 
        }
    ]
}
```

### 영토 이미지 파일 준비 팁

1. **이미지 크기**: 한반도 지도 이미지와 동일한 크기 및 비율로 만드세요
2. **투명 배경**: PNG 형식으로 영토 영역만 표시하고 나머지는 투명하게
3. **파일명 규칙**: 
   - 예: `territory-18bc.png` (기원전 18년)
   - 예: `territory-300.png` (300년)
   - 예: `territory/18bc.jpg` (폴더 구조 사용 가능)

## 파일 구조 예시

```
프로젝트 폴더/
├── index.html
├── style.css
├── script.js
├── hanbando.jpg          (한반도 지도)
├── territory-18bc.png    (기원전 18년 영토)
├── territory-0.png       (0년 영토)
├── territory-100.png     (100년 영토)
├── territory-300.png     (300년 영토)
└── ...
```

## 브라우저 호환성

- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
