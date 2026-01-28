// 백제 영토 변화 데이터
// 파일 이름의 숫자 부분을 년도로 사용하여 자동 생성
// 파일 이름 형식: bac{년도}.png (예: bac0.png → 0년, bac223.png → 223년)
const territoryImageFiles = [
    'bac0.png',
    'bac223.png',
    'bac254.png',
    'bac270.png',
    'bac330.png',
    'bac338.png',
    'bac365.png',
    'bac372.png',
    'bac386.png',
    'bac409.png',
    'bac450.png',
    'bac458.png',
    'bac526.png',
    'bac553.png',
    'bac556.png',
    'bac638.png',
    'bac648.png',
    'bac660.png'
];

// 파일 이름에서 년도 추출 함수
function extractYearFromFilename(filename) {
    const match = filename.match(/(\d+)\.png$/);
    return match ? parseInt(match[1]) : null;
}

// 파일 이름 기반으로 데이터 자동 생성
const baekjeTerritoryData = {
    periods: territoryImageFiles.map(filename => {
        const year = extractYearFromFilename(filename);
        return {
            year: year !== null ? year : 0,
            title: `${year}년`,
            description: `${year}년 백제의 영토 상태입니다.`,
            territoryImage: filename,
            territory: []
        };
    }).sort((a, b) => a.year - b.year) // 년도 순으로 정렬
};

// 전역 변수
let currentYear = 0; // 초기값은 데이터 로드 후 설정됨
let currentZoom = 1;
let currentPanX = 0;
let currentPanY = 0;
let territoryImageLoaded = false;
let territoryImageWidth = 0;
let territoryImageHeight = 0;
let mapContainerWidth = 0;
let mapContainerHeight = 0;

// DOM 요소
const mapArea = document.getElementById('map-area');
const mapImageContainer = document.getElementById('map-image-container');
const territoryImage = document.getElementById('territory-image');
const territoryOverlay = document.getElementById('territory-overlay');
const timelineSlider = document.getElementById('timeline-slider');
const yearDisplay = document.getElementById('year-display');
const periodTitle = document.getElementById('period-title');
const periodDescription = document.getElementById('period-description');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const resetViewBtn = document.getElementById('reset-view');

// 타임라인 마크 동적 생성
function createTimelineMarks() {
    const marksContainer = document.getElementById('timeline-marks');
    if (!marksContainer) return;
    
    marksContainer.innerHTML = '';
    
    const periods = baekjeTerritoryData.periods;
    
    // 먼저 모든 마크를 생성
    const marks = [];
    periods.forEach((period, index) => {
        const mark = document.createElement('span');
        mark.className = 'timeline-mark';
        mark.dataset.year = period.year;
        mark.textContent = `${period.year}년`;
        
        // 기간 인덱스 기반으로 위치 계산 (슬라이더와 동일한 방식)
        const positionPercent = (index / (periods.length - 1)) * 100;
        mark.style.left = `${positionPercent}%`;
        
        marksContainer.appendChild(mark);
        marks.push({
            element: mark,
            position: positionPercent,
            year: period.year,
            index: index
        });
    });
    
    // 겹침 방지 로직 - 마크들이 겹치지 않도록 배치
    adjustOverlappingMarks(marks, marksContainer);
    
    // 마크 클릭 이벤트 다시 등록
    document.querySelectorAll('.timeline-mark').forEach((mark, index) => {
        mark.addEventListener('click', () => {
            const year = parseInt(mark.dataset.year);
            const periodIndex = periods.findIndex(p => p.year === year);
            
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 768;
            
            // 슬라이더 값을 0-100으로 계산
            let sliderValue = (periodIndex / (periods.length - 1)) * 100;
            
            // 모바일 세로 모드에서는 역순으로 변환
            if (isPortrait && isMobile) {
                sliderValue = 100 - sliderValue;
            }
            
            timelineSlider.value = sliderValue;
            currentYear = year;
            updateTerritoryDisplay();
        });
    });
}

// 겹치는 마크들을 조정하여 겹치지 않게 배치
function adjustOverlappingMarks(marks, container) {
    // 모바일 세로 모드 감지
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;
    
    // 모바일 세로 모드에서는 마크를 세로로 배치하지 않음 (타임라인이 세로이므로)
    if (isPortrait && isMobile) {
        // 세로 모드: 마크들을 단순히 숨기거나 최소화
        marks.forEach(mark => {
            mark.element.style.top = '0';
            mark.element.style.display = 'block';
            mark.element.style.fontSize = '10px';
            mark.element.style.padding = '2px 4px';
        });
        container.style.height = 'auto';
        container.style.minHeight = '22px';
        return;
    }
    
    // 컨테이너 너비를 기준으로 계산 (데스크톱/가로 모드)
    const containerWidth = container.offsetWidth || container.parentElement.offsetWidth;
    const minPixelDistance = 120; // 마크들 사이의 최소 픽셀 거리
    
    // 위치 조정이 필요한 마크들을 처리
    for (let i = 0; i < marks.length; i++) {
        let currentMark = marks[i];
        let adjustedRow = 0;
        
        // 이전 마크들과 겹치는지 확인
        for (let j = 0; j < i; j++) {
            const prevMark = marks[j];
            const prevWidth = prevMark.element.offsetWidth || 80;
            const currentWidth = currentMark.element.offsetWidth || 80;
            
            // 픽셀 거리 계산
            const prevPixelPos = (prevMark.position / 100) * containerWidth;
            const currentPixelPos = (currentMark.position / 100) * containerWidth;
            
            // 중심 기준 거리
            const prevLeft = prevPixelPos - prevWidth / 2;
            const prevRight = prevPixelPos + prevWidth / 2;
            const currentLeft = currentPixelPos - currentWidth / 2;
            const currentRight = currentPixelPos + currentWidth / 2;
            
            // 겹치는지 확인
            if (!(currentRight + 10 < prevLeft - 10 || currentLeft - 10 > prevRight + 10)) {
                // 겹침 - 행 조정
                adjustedRow = Math.max(adjustedRow, (prevMark.row || 0) + 1);
            }
        }
        
        currentMark.row = adjustedRow;
        
        // CSS를 통해 행 위치 설정
        const rowHeight = 22;
        const topOffset = adjustedRow * rowHeight;
        currentMark.element.style.top = `${topOffset}px`;
        currentMark.element.style.marginTop = '0';
    }
    
    // 컨테이너 높이 동적으로 조정
    if (marks.length > 0) {
        const maxRow = Math.max(...marks.map(m => m.row || 0));
        const containerHeight = (maxRow + 1) * 22 + 4;
        container.style.height = `${containerHeight}px`;
    }
}

// 초기화 함수 (한반도 지도 로드 제거)
function initializeMap() {
    // 초기 년도를 첫 번째 데이터로 설정
    if (baekjeTerritoryData.periods.length > 0) {
        currentYear = baekjeTerritoryData.periods[0].year;
        // 슬라이더를 0-100 범위로 설정
        timelineSlider.min = 0;
        timelineSlider.max = 100;
        timelineSlider.value = 0; // PC 모드와 모바일 모드 모두 0부터 시작
    }
    createTimelineMarks();
    updateMapBounds();
    updateTerritoryDisplay();
    
    // 모바일 세로 모드에서 초기 줌 설정
    adjustZoomForMobilePortrait();
}

// 모바일 세로 모드에 맞게 줌 조정 (한반도 중심으로 설정)
function adjustZoomForMobilePortrait() {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;
    
    console.log('adjustZoomForMobilePortrait called:', { isPortrait, isMobile, territoryImageLoaded });
    
    if (isPortrait && isMobile) {
        // territoryImageLoaded 조건 제거 - 모바일에서는 항상 적용
        console.log('Applying mobile portrait adjustments');
        
        // 화면 크기
        const screenWidth = mapContainerWidth;
        const screenHeight = mapContainerHeight;
        
        // 이미지 원본 크기 (territoryImageLoaded가 false일 때는 기본값 사용)
        const imgWidth = territoryImageLoaded ? territoryImageWidth : 1000; // 기본값
        const imgHeight = territoryImageLoaded ? territoryImageHeight : 800; // 기본값
        
        console.log('Screen size:', screenWidth, screenHeight);
        console.log('Image size:', imgWidth, imgHeight);
        
        // 한반도를 화면에 맞게 표시하기 위한 줌 레벨 계산
        // 한반도는 일반적으로 이미지 중앙에 있으므로 cover 모드로 설정
        const zoomX = screenWidth / imgWidth;
        const zoomY = screenHeight / imgHeight;
        
        // 더 큰 값을 선택하여 전체 화면을 채움 (cover 효과)
        // 줌을 최소 1로 설정하여 pan이 작동하도록 함
        currentZoom = Math.max(zoomX, zoomY, 1);
        
        // 한반도 중심으로 시점 설정 (이미지 중앙보다 오른쪽으로 이동)
        // 한반도가 서해 중심으로 나오는 것을 보정하기 위해 오른쪽으로 이동
        currentPanX = 1200; // 오른쪽으로 1200px 이동 (한반도를 오른쪽으로)
        currentPanY = 0;
        
        console.log('Applied zoom and pan:', { currentZoom, currentPanX, currentPanY });
        
        applyTransform();
    } else {
        console.log('Conditions not met for zoom adjustment');
    }
}

// 슬라이더 방향 조정 (세로 모드에서는 반대 방향)
function handleTimelineSliderChange(e) {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = window.innerWidth < 768;
    
    const periods = baekjeTerritoryData.periods;
    let sliderValue = parseInt(e.target.value);
    
    // 모바일 세로 모드: 100으로 들어온 값을 0으로 변환 (위에서 아래로 시간 진행)
    if (isPortrait && isMobile) {
        sliderValue = 100 - sliderValue;
    }
    
    // 슬라이더 값(0-100)을 기간 인덱스로 매핑
    const periodIndex = Math.round((sliderValue / 100) * (periods.length - 1));
    currentYear = periods[Math.max(0, Math.min(periodIndex, periods.length - 1))].year;
    
    updateTerritoryDisplay();
}

// 현재 연도에 해당하는 기간 찾기
function findPeriodForYear(year) {
    let closestPeriod = baekjeTerritoryData.periods[0];
    
    for (let i = 0; i < baekjeTerritoryData.periods.length; i++) {
        if (baekjeTerritoryData.periods[i].year <= year) {
            closestPeriod = baekjeTerritoryData.periods[i];
        } else {
            break;
        }
    }
    
    return closestPeriod;
}

// 지도 경계 업데이트
function updateMapBounds() {
    const mapRect = mapImageContainer.getBoundingClientRect();
    mapContainerWidth = mapRect.width;
    mapContainerHeight = mapRect.height;
}

// 영토 이미지 로드
function loadTerritoryImage(imagePath) {
    if (!imagePath || imagePath === '') {
        // 이미지가 없으면 SVG 사용
        territoryImage.style.display = 'none';
        territoryImageLoaded = false;
        return;
    }
    
    territoryImage.style.display = 'block';
    territoryImage.style.opacity = '0';
    
    const img = new Image();
    img.onload = () => {
        territoryImage.src = imagePath;
        // 이미지 원본 크기 저장
        territoryImageWidth = img.naturalWidth;
        territoryImageHeight = img.naturalHeight;
        territoryImageLoaded = true;
        territoryImage.style.opacity = '1';
        // 영토 이미지 변환 동기화
        syncTerritoryImageTransform();
        updateMapBounds();
        
        // 이미지 로드 후 모바일 세로 모드 줌 조정
        adjustZoomForMobilePortrait();
    };
    img.onerror = () => {
        console.warn(`영토 이미지를 로드할 수 없습니다: ${imagePath}`);
        territoryImage.style.display = 'none';
        territoryImageLoaded = false;
    };
    img.src = imagePath;
}

// 영토 이미지 변환 동기화
function syncTerritoryImageTransform() {
    if (territoryImage.style.display !== 'none' && territoryImageLoaded) {
        // 줌이 1배일 때 원본 크기를 넘지 않도록 제한
        // cover 모드이므로 이미지가 화면을 채우기 위해 원본보다 크게 표시될 수 있음
        // 이를 방지하기 위해 줌이 1배일 때는 이미지 크기를 원본 크기로 제한
        
        let effectiveZoom = currentZoom;
        if (currentZoom <= 1) {
            // 원본 이미지 크기와 컨테이너 크기 비교
            const imageAspect = territoryImageWidth / territoryImageHeight;
            const containerAspect = mapContainerWidth / mapContainerHeight;
            
            // cover 모드로 화면을 채우는 데 필요한 최소 스케일 계산
            let minScaleForCover;
            if (containerAspect > imageAspect) {
                minScaleForCover = mapContainerHeight / territoryImageHeight;
            } else {
                minScaleForCover = mapContainerWidth / territoryImageWidth;
            }
            
            // cover 스케일이 1보다 크면 원본보다 크게 표시되는 것
            // 줌이 1배일 때는 원본 크기를 넘지 않도록 1로 제한
            if (minScaleForCover > 1) {
                // 이미지 크기를 원본 크기로 제한
                effectiveZoom = 1 / minScaleForCover;
            } else {
                effectiveZoom = currentZoom;
            }
        }
        
        territoryImage.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${effectiveZoom})`;
        territoryImage.style.transformOrigin = 'center center';
    }
}

// 영토 표시 업데이트
function updateTerritoryDisplay() {
    const period = findPeriodForYear(currentYear);
    
    // 기간 정보 업데이트
    yearDisplay.textContent = `${period.year}년`;
    periodTitle.textContent = `${period.year}년`;
    periodDescription.textContent = period.description;
    
    // 영토 이미지가 있으면 이미지 사용, 없으면 SVG 사용
    if (period.territoryImage && period.territoryImage !== '') {
        // 이미지 사용
        loadTerritoryImage(period.territoryImage);
        // SVG 오버레이 숨기기
        territoryOverlay.innerHTML = '';
    } else {
        // SVG 사용
        territoryImage.style.display = 'none';
        territoryImageLoaded = false;
        
        // SVG 영토 영역 초기화
        territoryOverlay.innerHTML = '';
        
        // 컨테이너 크기 가져오기
        updateMapBounds();
        const mapWidth = mapContainerWidth;
        const mapHeight = mapContainerHeight;
        
        // SVG 크기 설정
        territoryOverlay.setAttribute('viewBox', `0 0 ${mapWidth} ${mapHeight}`);
        territoryOverlay.setAttribute('width', mapWidth);
        territoryOverlay.setAttribute('height', mapHeight);
        
        // 영토 영역 그리기
        period.territory.forEach(territory => {
            if (territory.type === 'path') {
                // SVG path 사용
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                // path 데이터를 비율 좌표에서 실제 픽셀 좌표로 변환
                const scaledPath = scalePath(territory.path, mapWidth, mapHeight);
                path.setAttribute('d', scaledPath);
                path.setAttribute('fill', 'rgba(66, 133, 244, 0.3)');
                path.setAttribute('stroke', '#4285f4');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('stroke-linecap', 'round');
                
                territoryOverlay.appendChild(path);
            } else if (territory.points) {
                // 좌표 배열 사용
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const points = territory.points.map(p => {
                    const x = (p.x / 100) * mapWidth;
                    const y = (p.y / 100) * mapHeight;
                    return `${x},${y}`;
                }).join(' ');
                polygon.setAttribute('points', points);
                polygon.setAttribute('fill', 'rgba(66, 133, 244, 0.3)');
                polygon.setAttribute('stroke', '#4285f4');
                polygon.setAttribute('stroke-width', '2');
                
                territoryOverlay.appendChild(polygon);
            }
        });
    }
}

// Path 좌표를 비율에서 실제 픽셀 좌표로 변환
function scalePath(pathString, width, height) {
    // path 문자열의 좌표를 파싱하여 스케일링
    return pathString.replace(/([ML])\s+([0-9.]+),([0-9.]+)/g, (match, cmd, x, y) => {
        const scaledX = (parseFloat(x) / 100) * width;
        const scaledY = (parseFloat(y) / 100) * height;
        return `${cmd} ${scaledX},${scaledY}`;
    }).replace(/Z/g, 'Z');
}

// 타임라인 슬라이더 이벤트
timelineSlider.addEventListener('input', handleTimelineSliderChange);

// 타임라인 마크 클릭 이벤트는 createTimelineMarks 함수 내부에서 처리됨

// 마우스 위치 기준 줌 함수
// zoomFactor > 1: 줌 인 (자유롭게)
// zoomFactor < 1: 줌 아웃 (최소 1배로 제한)
function zoomAtPoint(zoomFactor, mouseX, mouseY) {
    const rect = mapImageContainer.getBoundingClientRect();
    const containerX = mouseX - rect.left;
    const containerY = mouseY - rect.top;
    
    // 컨테이너 중심 좌표
    const centerX = mapContainerWidth / 2;
    const centerY = mapContainerHeight / 2;
    
    // 마우스 위치를 중심 기준으로 변환
    const mouseOffsetX = containerX - centerX;
    const mouseOffsetY = containerY - centerY;
    
    // 줌 전 마우스 위치의 이미지 상대 좌표
    const imageX = (mouseOffsetX - currentPanX) / currentZoom;
    const imageY = (mouseOffsetY - currentPanY) / currentZoom;
    
    // 새로운 줌 레벨 계산
    let newZoom;
    if (zoomFactor > 1) {
        // 줌 인: 자유롭게 (제한 없음)
        newZoom = currentZoom * zoomFactor;
    } else {
        // 줌 아웃: 최소 1배로 제한 (원본 크기 이상)
        newZoom = Math.max(1, currentZoom * zoomFactor);
    }
    
    // 줌 후에도 같은 위치에 있도록 pan 조정
    currentZoom = newZoom;
    currentPanX = mouseOffsetX - imageX * newZoom;
    currentPanY = mouseOffsetY - imageY * newZoom;
    
    applyTransform();
    updateTerritoryDisplay();
}

// 줌 인 (중앙 기준)
zoomInBtn.addEventListener('click', () => {
    const rect = mapImageContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomAtPoint(1.2, centerX, centerY);
});

// 줌 아웃 (중앙 기준)
zoomOutBtn.addEventListener('click', () => {
    const rect = mapImageContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    zoomAtPoint(0.8, centerX, centerY);
});

// 뷰 리셋
resetViewBtn.addEventListener('click', () => {
    currentZoom = 1;
    currentPanX = 0;
    currentPanY = 0;
    applyTransform();
    updateTerritoryDisplay();
});

// 변환 적용 (팬 허용 - 줌 중심 이동)
function applyTransform() {
    updateMapBounds();
    
    // 경계 제한 (이미지가 화면 밖으로 나가지 않도록)
    if (territoryImageLoaded && territoryImageWidth > 0 && territoryImageHeight > 0) {
        const imageAspect = territoryImageWidth / territoryImageHeight;
        const containerAspect = mapContainerWidth / mapContainerHeight;
        
        // cover 모드에서의 기본 표시 크기 계산 (화면을 채우는 최소 크기)
        let coverDisplayWidth, coverDisplayHeight;
        
        if (containerAspect > imageAspect) {
            // 컨테이너가 더 넓음 - 높이 기준으로 화면을 채움
            coverDisplayHeight = mapContainerHeight;
            coverDisplayHeight = Math.min(coverDisplayHeight, territoryImageHeight);
            coverDisplayWidth = coverDisplayHeight * imageAspect;
        } else {
            // 컨테이너가 더 높음 - 너비 기준으로 화면을 채움
            coverDisplayWidth = mapContainerWidth;
            coverDisplayWidth = Math.min(coverDisplayWidth, territoryImageWidth);
            coverDisplayHeight = coverDisplayWidth / imageAspect;
        }
        
        // 원본 이미지 크기를 넘지 않도록 제한
        const baseDisplayWidth = Math.min(coverDisplayWidth, territoryImageWidth);
        const baseDisplayHeight = Math.min(coverDisplayHeight, territoryImageHeight);
        
        // 줌 적용된 크기
        let scaledWidth = baseDisplayWidth * currentZoom;
        let scaledHeight = baseDisplayHeight * currentZoom;
        
        // 줌이 1배일 때 원본 크기를 넘지 않도록 강제 제한
        if (currentZoom <= 1) {
            scaledWidth = Math.min(scaledWidth, territoryImageWidth);
            scaledHeight = Math.min(scaledHeight, territoryImageHeight);
            // 줌이 1배 이하일 때는 pan을 허용하여 모바일에서 한반도 위치 조정 가능
            // 모바일 세로 모드에서는 pan 제한 없음
            const isPortrait = window.innerHeight > window.innerWidth;
            const isMobile = window.innerWidth < 768;
            if (isPortrait && isMobile) {
                // 모바일 세로 모드에서는 pan 제한을 완전히 제거
                // currentPanX와 currentPanY를 그대로 사용
            } else {
                // 일반 모드에서는 pan 제한
                currentPanX = 0;
                currentPanY = 0;
            }
        } else {
            // 줌 인 시 경계 계산
            const maxPanX = Math.max(0, (scaledWidth - mapContainerWidth) / 2);
            const maxPanY = Math.max(0, (scaledHeight - mapContainerHeight) / 2);
            const minPanX = -maxPanX;
            const minPanY = -maxPanY;
            
            currentPanX = Math.max(minPanX, Math.min(maxPanX, currentPanX));
            currentPanY = Math.max(minPanY, Math.min(maxPanY, currentPanY));
        }
    } else {
        // 이미지가 없을 때
        currentPanX = 0;
        currentPanY = 0;
    }
    
    // SVG 오버레이도 동일하게 변환
    territoryOverlay.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoom})`;
    territoryOverlay.style.transformOrigin = 'center center';
    
    // 영토 이미지 변환
    syncTerritoryImageTransform();
}

// 드래그 기능 비활성화 (이미지 고정)
// 드래그 이벤트 제거됨 - 이미지가 움직이지 않음

// 휠 줌 (마우스 커서 위치 기준)
mapArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // 줌 인: 자유롭게, 줌 아웃: 최소 1배로 제한
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9; // 줌 인 또는 줌 아웃
    zoomAtPoint(zoomFactor, e.clientX, e.clientY);
});

// 윈도우 리사이즈 시 경계 업데이트
window.addEventListener('resize', () => {
    updateMapBounds();
    applyTransform();
    updateTerritoryDisplay();
    // 모바일 방향 변경 시 타임라인 마크 다시 조정
    createTimelineMarks();
    // 모바일 세로 모드 줌 조정
    adjustZoomForMobilePortrait();
});

// 방향 변경 이벤트
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        updateMapBounds();
        applyTransform();
        updateTerritoryDisplay();
        createTimelineMarks();
        // 방향 변경 후 줌 조정
        adjustZoomForMobilePortrait();
    }, 100);
});

// 터치 이벤트 지원 (모바일) - 핀치 줌 (두 터치 중점 기준)
let lastTouchDistance = 0;
let touchCenterX = 0;
let touchCenterY = 0;

mapArea.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        // 싱글 터치: 드래그 기능 제거됨
    } else if (e.touches.length === 2) {
        // 두 터치: 핀치 줌 시작
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        // 두 터치의 중점 계산
        touchCenterX = (touch1.clientX + touch2.clientX) / 2;
        touchCenterY = (touch1.clientY + touch2.clientY) / 2;
    }
    e.preventDefault();
});

mapArea.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        // 싱글 터치 드래그: 시점 이동 비활성화 (모바일 모드에서 제거)
    } else if (e.touches.length === 2) {
        // 두 터치: 핀치 줌
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        
        // 두 터치의 중점 업데이트
        touchCenterX = (touch1.clientX + touch2.clientX) / 2;
        touchCenterY = (touch1.clientY + touch2.clientY) / 2;
        
        if (lastTouchDistance > 0) {
            const scale = distance / lastTouchDistance;
            // 줌 인: 자유롭게, 줌 아웃: 최소 1배로 제한
            let newZoom;
            if (scale > 1) {
                // 줌 인: 제한 없음
                newZoom = currentZoom * scale;
            } else {
                // 줌 아웃: 최소 1배로 제한
                newZoom = Math.max(1, currentZoom * scale);
            }
            const zoomFactor = newZoom / currentZoom;
            zoomAtPoint(zoomFactor, touchCenterX, touchCenterY);
        }
        lastTouchDistance = distance;
    }
    e.preventDefault();
});

mapArea.addEventListener('touchend', (e) => {
    if (e.touches.length === 0) {
        // 모든 터치가 끝남
        lastTouchDistance = 0;
    } else if (e.touches.length === 1) {
        // 하나의 터치만 남음: 핀치 줌 준비
        lastTouchDistance = 0;
    }
});

// 초기화
initializeMap();
