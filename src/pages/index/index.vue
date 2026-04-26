<template>
  <div class="container">
    <!-- 首页头图Banner区域 -->
    <div class="banner">
      <img class="banner-bg" src="/image/2.webp" alt="桂林1944背景" fetchpriority="high" />
      <div class="banner-content">
        <h1 class="banner-title">桂林1944·命运应答</h1>
        <h2 class="banner-subtitle">文创产品数字化展示</h2>
        <div class="banner-divider">
          <div class="divider-star">★</div>
        </div>
        <div class="banner-stamp">桂林1944</div>
      </div>
      <!-- 装饰元素 -->
      <div class="banner-decoration top-left"></div>
      <div class="banner-decoration top-right"></div>
      <div class="banner-decoration bottom-left"></div>
      <div class="banner-decoration bottom-right"></div>
    </div>



    <!-- 产品分类展示区域 -->
    <div class="product-category">
      <h2 class="section-title">产品分类</h2>
      <div class="category-container">
        <!-- 侧边导航栏 -->
        <div class="sidebar">
          <div
            v-for="(mainCategory, index) in mainCategories"
            :key="index"
            class="sidebar-item"
            :class="{ active: selectedMainCategory === index }"
            @click="selectMainCategory(index)"
          >
            <img :src="mainCategory.thumbImage" class="sidebar-image" loading="lazy" :alt="mainCategory.name" />
            <span class="sidebar-name">{{ mainCategory.name }}</span>
          </div>
        </div>

        <!-- 主分类内容区域 -->
        <div class="main-content">
          <div v-if="selectedMainCategory !== -1">
            <!-- 产品轮播区域 -->
            <div class="product-carousel">
              <!-- 轮播内容 -->
              <div 
                class="carousel-container" 
                @touchstart="touchStart" 
                @touchmove="touchMove" 
                @touchend="touchEnd"
              >
                <div 
                  class="carousel-slide" 
                  :class="{ 'transition': isSliding }"
                  :style="{ transform: `translateX(-${currentProductIndex * 100}%)` }"
                >
                  <div
                    v-for="(subCategory, index) in mainCategories[selectedMainCategory].subCategories"
                    :key="`${selectedMainCategory}-${index}`"
                    class="carousel-item"
                  >
                    <div class="carousel-item-content">
                      <div class="image-wrapper">
                        <div class="image-placeholder" :class="{ hidden: isImageLoaded(subCategory.image) }"></div>
                        <img
                          :src="subCategory.image"
                          class="sub-category-image"
                          :class="{ loaded: isImageLoaded(subCategory.image) }"
                          loading="lazy"
                          :alt="subCategory.name"
                          @load="onImageLoaded(subCategory.image)"
                        />
                      </div>
                      <h3 class="sub-category-name">{{ subCategory.name }}</h3>
                      <p class="sub-category-description">{{ subCategory.description }}</p>
                      <div class="carousel-controls">
                        <button class="carousel-btn carousel-btn-left" @click="prevProduct" :disabled="currentProductIndex === 0">
                          &lt;
                        </button>
                        <button class="view-details-btn" @click="selectProduct(subCategory)">查看详情</button>
                        <button class="carousel-btn carousel-btn-right" @click="nextProduct" :disabled="currentProductIndex === mainCategories[selectedMainCategory].subCategories.length - 1">
                          &gt;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 导航指示器 -->
              <div class="carousel-indicators">
                <div 
                  v-for="(_, index) in mainCategories[selectedMainCategory].subCategories" 
                  :key="index"
                  class="indicator"
                  :class="{ active: index === currentProductIndex }"
                  @click="goToProduct(index)"
                ></div>
              </div>
              
              <!-- 页码信息 -->
              <div class="carousel-pagination">
                {{ currentProductIndex + 1 }} / {{ mainCategories[selectedMainCategory].subCategories.length }}
              </div>
            </div>
          </div>
          <div v-else class="welcome-content">
            <p class="welcome-text">请点击选择产品类型</p>
            <div class="welcome-image-container">
              <img src="/image/2.webp" class="welcome-image" alt="欢迎图片" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 单个产品详情展示区域 -->
    <div class="product-detail" v-if="selectedProduct" @click.self="closeDetail">
      <div class="detail-content">
        <img :src="selectedProduct.image" class="detail-image" @click="zoomImage" :alt="selectedProduct.name" />
        <div class="detail-info">
          <h3 class="detail-name">{{ selectedProduct.name }}</h3>
          <div class="detail-section">
            <h4 class="detail-section-title">设计寓意</h4>
            <p class="detail-meaning">{{ selectedProduct.meaning || '该产品设计融合了桂林山水元素与抗战文化记忆，展现了历史与现代的结合。' }}</p>
          </div>
          <div class="detail-section">
            <h4 class="detail-section-title">历史意象</h4>
            <p class="detail-history">{{ selectedProduct.history || '1944年桂林抗战时期，无数英雄儿女为了国家和民族的尊严英勇奋斗，这段历史成为了我们宝贵的精神财富。' }}</p>
          </div>
          <div class="detail-section" v-if="selectedProduct.material">
            <h4 class="detail-section-title">材质说明</h4>
            <p class="detail-material">{{ selectedProduct.material }}</p>
          </div>
          <div class="detail-section" v-if="selectedProduct.size">
            <h4 class="detail-section-title">尺寸规格</h4>
            <p class="detail-size">{{ selectedProduct.size }}</p>
          </div>
          <div class="detail-section" v-if="selectedProduct.features">
            <h4 class="detail-section-title">产品特点</h4>
            <p class="detail-features">{{ selectedProduct.features }}</p>
          </div>
        </div>
      </div>
      <div class="detail-close" @click="closeDetail">关闭</div>
    </div>

    <!-- 图片放大查看区域 -->
    <div class="image-zoom" v-if="isZooming" @click="closeZoom">
      <img :src="selectedProduct?.image" class="zoom-image" alt="放大图片" />
      <div class="zoom-close" @click.stop="closeZoom">关闭</div>
    </div>

    <!-- 系列主题整合区域 -->
    <div class="themes">
      <h2 class="section-title">系列主题</h2>
      <div class="theme-timeline">
        <div v-for="(theme, index) in themes" :key="index" class="theme-item">
          <div class="theme-dot"></div>
          <div class="theme-content">
            <h3 class="theme-name">{{ theme.name }}</h3>
            <p class="theme-desc">{{ theme.description }}</p>
            <p class="theme-geography">{{ theme.thing }}</p>
            <p class="theme-color">{{ theme.speak }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 结尾展示区域 -->
    <div class="ending">
      <h2 class="ending-title">牢记历史，珍视和平，薪火相传，面向未来</h2>
      <p class="ending-info">项目相关单位信息</p>
      <!-- 装饰元素 -->
      <div class="ending-decoration left"></div>
      <div class="ending-decoration right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, nextTick, watch } from 'vue'

const selectedMainCategory = ref(-1)
const selectedProduct = shallowRef<any>(null)
const isZooming = ref(false)
const loadedImages = ref<Set<string>>(new Set())
const transitioning = ref(false)

// 轮播相关变量
const currentProductIndex = ref(0)
const isSliding = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)

const onImageLoaded = (src: string) => {
  loadedImages.value.add(src)
}

const isImageLoaded = (src: string) => {
  return loadedImages.value.has(src)
}

// 7个主分类，每个分类下包含5个策略子分类
const mainCategories = [
  {
    name: '书签',
    image: '/image/书签分类总览图/{C81A4200-5390-4268-B73B-7B284BFAB786}.webp',
    thumbImage: '/image-thumb/书签分类总览图/{C81A4200-5390-4268-B73B-7B284BFAB786}.webp',
    subCategories: [
      {
        name: '呐喊者·书签',
        image: '/image/书签/呐喊者/384dc70a88e0fcef346945a42c544bbc.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以独秀峰声波刺破云层为核心图形，靛蓝色调展现信息穿透的力量。',
        history: '《救亡日报》在轰炸中坚持手摇印刷、出版发声，书签设计旨在传递这份不屈的声音。',
        material: '优质纸张，防水处理，耐用持久。',
        size: '15cm × 5cm',
        features: '采用特种工艺印刷，靛蓝色调鲜明，图案清晰，边缘光滑。'
      },
      {
        name: '燃灯者·书签',
        image: '/image/书签/燃灯者/6.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以象鼻山时钟与幕布交织为核心图形，赭红色调展现仪式维持的力量。',
        history: '西南剧展在时局紧张情况下坚持举办，书签设计旨在传承这份坚守精神。',
        material: '优质纸张，防水处理，耐用持久。',
        size: '15cm × 5cm',
        features: '采用特种工艺印刷，赭红色调鲜明，图案清晰，边缘光滑。'
      },
      {
        name: '织网者·书签',
        image: '/image/书签/织网者/3.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以两江四湖节点连线成网为核心图形，青绿色调展现关系编织的力量。',
        history: '织网者象征凝聚千余名文化力量的精神，书签设计旨在传承这份团结精神。',
        material: '优质纸张，防水处理，耐用持久。',
        size: '15cm × 5cm',
        features: '采用特种工艺印刷，青绿色调鲜明，图案清晰，边缘光滑。'
      },
      {
        name: '摆渡者·书签',
        image: '/image/书签/摆渡者/a9defb307e160f832444fb8b9fc48221.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以漓江断桥上报纸折成纸船为核心图形，明黄色调展现路径重构的力量。',
        history: '摆渡者象征在绝境中另寻新途的精神，书签设计旨在传承这份机智与勇气。',
        material: '优质纸张，防水处理，耐用持久。',
        size: '15cm × 5cm',
        features: '采用特种工艺印刷，明黄色调鲜明，图案清晰，边缘光滑。'
      },
      {
        name: '潜火者·书签',
        image: '/image/书签/潜火者/4.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以七星岩冻土下藏光点为核心图形，墨黑色调展现能量隐匿的力量。',
        history: '潜火者象征在严峻环境下保存火种的精神，书签设计旨在传承这份隐忍与坚持。',
        material: '优质纸张，防水处理，耐用持久。',
        size: '15cm × 5cm',
        features: '采用特种工艺印刷，墨黑色调鲜明，图案清晰，边缘光滑。'
      }
    ]
  },
  {
    name: '徽章',
    image: '/image/徽章分类总览图/{112F6962-4CFD-4BD4-B30C-D8E38907DB92}.webp',
    thumbImage: '/image-thumb/徽章分类总览图/{112F6962-4CFD-4BD4-B30C-D8E38907DB92}.webp',
    subCategories: [
      {
        name: '呐喊者·徽章',
        image: '/image/徽章/呐喊者/09baeb76c3f73bf02b32d08884c647ec_720.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波刺破云层为核心图形，展现信息穿透的力量与勇气。',
        history: '呐喊者象征在信息封锁中撕开缺口的精神，徽章设计以此为灵感。',
        material: '锌合金材质，镀金工艺，色彩鲜艳。',
        size: '直径3.5cm',
        features: '采用压铸工艺，表面光滑，色彩持久，配有安全别针。'
      },
      {
        name: '燃灯者·徽章',
        image: '/image/徽章/燃灯者/0b26fabef7ef81a1d3ea7788cff37f59_720.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布交织为核心图形，展现文化守护者的坚持。',
        history: '燃灯者象征在艰难环境中维持文化仪式的精神，徽章设计以此为灵感。',
        material: '铜质材质，珐琅工艺，精美细致。',
        size: '直径4cm',
        features: '采用珐琅彩工艺，色彩饱满，图案立体，具有较高的收藏价值。'
      },
      {
        name: '织网者·徽章',
        image: '/image/徽章/织网者/a819e66a131f08e438b1967b48a9d734_720.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网为核心图形，展现统一战线的凝聚力。',
        history: '织网者象征在抗战时期编织统一战线的精神，徽章设计以此为灵感。',
        material: '锌合金材质，镀金工艺，色彩鲜艳。',
        size: '直径3.5cm',
        features: '采用压铸工艺，表面光滑，色彩持久，配有安全别针。'
      },
      {
        name: '摆渡者·徽章',
        image: '/image/徽章/摆渡者/0222d82902e0b914cdbc26a29c4d005e_720.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸折成纸船为核心图形，展现灵活应变的智慧。',
        history: '摆渡者象征在艰难环境中寻找新路径的精神，徽章设计以此为灵感。',
        material: '铜质材质，珐琅工艺，精美细致。',
        size: '直径4cm',
        features: '采用珐琅彩工艺，色彩饱满，图案立体，具有较高的收藏价值。'
      },
      {
        name: '潜火者·徽章',
        image: '/image/徽章/潜火者/95f280e7b9ed92abc98da24a002c323b_720.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点为核心图形，展现隐忍待发的精神。',
        history: '潜火者象征在黑暗中保存光明的精神，徽章设计以此为灵感。',
        material: '锌合金材质，镀金工艺，色彩鲜艳。',
        size: '直径3.5cm',
        features: '采用压铸工艺，表面光滑，色彩持久，配有安全别针。'
      }
    ]
  },
  {
    name: '印章',
    image: '/image/印章分类总览图/{6A7D171F-F02E-49BF-BAB4-8E8BC5D36095}.webp',
    thumbImage: '/image-thumb/印章分类总览图/{6A7D171F-F02E-49BF-BAB4-8E8BC5D36095}.webp',
    subCategories: [
      {
        name: '呐喊者·印章',
        image: '/image/印章/呐喊者/c4cfad4f264f0df2214c15fb725aef58.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波图形为印章图案，象征文字的力量与声音的传递。',
        history: '印章是抗战时期重要的信息传递工具，设计以此为背景。',
        material: '优质木材，雕刻精细，印面清晰。',
        size: '直径3cm，高度8cm',
        features: '采用手工雕刻工艺，印面清晰，木质纹理美观，手感舒适。'
      },
      {
        name: '燃灯者·印章',
        image: '/image/印章/燃灯者/ae6a868e8341494d2fc04dba3586dbda.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布为核心图案，象征文化守护的坚持与传承。',
        history: '印章是抗战时期文化工作者的重要工具，设计以此为背景。',
        material: '优质木材，雕刻精细，印面清晰。',
        size: '直径3cm，高度8cm',
        features: '采用手工雕刻工艺，印面清晰，木质纹理美观，手感舒适。'
      },
      {
        name: '织网者·印章',
        image: '/image/印章/织网者/c2770b08472822e74baabfed79a6fdba.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网为核心图案，象征统一战线的团结与联络。',
        history: '印章是抗战时期团结各界人士的重要工具，设计以此为背景。',
        material: '优质木材，雕刻精细，印面清晰。',
        size: '直径3cm，高度8cm',
        features: '采用手工雕刻工艺，印面清晰，木质纹理美观，手感舒适。'
      },
      {
        name: '摆渡者·印章',
        image: '/image/印章/摆渡者/e6f1d9ca74aa352ec0531bfbc46b73f5_720.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸纸船为核心图案，象征在绝境中寻找新途径的智慧。',
        history: '印章是抗战时期地下工作者的重要工具，设计以此为背景。',
        material: '优质木材，雕刻精细，印面清晰。',
        size: '直径3cm，高度8cm',
        features: '采用手工雕刻工艺，印面清晰，木质纹理美观，手感舒适。'
      },
      {
        name: '潜火者·印章',
        image: '/image/印章/潜火者/a5373b07f4e706a15a9679d4693c9a7e.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点为核心图案，象征在黑暗中保存光明的智慧。',
        history: '印章是抗战时期地下工作者的重要工具，设计以此为背景。',
        material: '优质木材，雕刻精细，印面清晰。',
        size: '直径3cm，高度8cm',
        features: '采用手工雕刻工艺，印面清晰，木质纹理美观，手感舒适。'
      }
    ]
  },
  {
    name: '明信片',
    image: '/image/明信片分类总览图/{099C7002-ECAC-46CB-A6C2-15810E6C5E08}.webp',
    thumbImage: '/image-thumb/明信片分类总览图/{099C7002-ECAC-46CB-A6C2-15810E6C5E08}.webp',
    subCategories: [
      {
        name: '呐喊者·明信片',
        image: '/image/明信片/呐喊者/6b267e97849ad87816ed302d75fa377c_720.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波刺破云层为核心，靛蓝色调展现抗战时期的信息传播。',
        history: '抗战时期明信片是重要的信息载体，设计以此为灵感。',
        material: '优质铜版纸，印刷精美，色彩鲜艳。',
        size: '10cm × 15cm',
        features: '采用高清印刷工艺，色彩还原度高，纸张质感优良，适合收藏和邮寄。'
      },
      {
        name: '燃灯者·明信片',
        image: '/image/明信片/燃灯者/132a1d1718a017754a1bd2ded367329a_720.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布交织为核心，赭红色调展现西南剧展的坚守精神。',
        history: '西南剧展近百场演出坚守阵地，明信片以此为设计灵感。',
        material: '优质铜版纸，印刷精美，色彩鲜艳。',
        size: '10cm × 15cm',
        features: '采用高清印刷工艺，色彩还原度高，纸张质感优良，适合收藏和邮寄。'
      },
      {
        name: '织网者·明信片',
        image: '/image/明信片/织网者/2af3b97e5589098b36e46741b881d9f6.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网为核心，青绿色调展现统一战线的凝聚力。',
        history: '中共联络各界进步人士，明信片以此为设计灵感。',
        material: '优质铜版纸，印刷精美，色彩鲜艳。',
        size: '10cm × 15cm',
        features: '采用高清印刷工艺，色彩还原度高，纸张质感优良，适合收藏和邮寄。'
      },
      {
        name: '摆渡者·明信片',
        image: '/image/明信片/摆渡者/547794668a5dcf4c10e87387ecedf63a_720.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸折成纸船为核心，明黄色调展现转移阵地的智慧。',
        history: '地下党员在昭平创办《广西日报》（昭平版），明信片以此为设计灵感。',
        material: '优质铜版纸，印刷精美，色彩鲜艳。',
        size: '10cm × 15cm',
        features: '采用高清印刷工艺，色彩还原度高，纸张质感优良，适合收藏和邮寄。'
      },
      {
        name: '潜火者·明信片',
        image: '/image/明信片/潜火者/0ae2fbc9f4b123e13c06afc56b4ec5b1.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点为核心，墨黑色调展现隐匿中的坚持。',
        history: '临阳联队从基层武装发展为坚强敌后抗日力量，明信片以此为设计灵感。',
        material: '优质铜版纸，印刷精美，色彩鲜艳。',
        size: '10cm × 15cm',
        features: '采用高清印刷工艺，色彩还原度高，纸张质感优良，适合收藏和邮寄。'
      }
    ]
  },
  {
    name: '贴纸',
    image: '/image/贴纸分类总览图/{060AA07F-9C1E-4B04-8D9C-245F156E0F43}.webp',
    thumbImage: '/image-thumb/贴纸分类总览图/{060AA07F-9C1E-4B04-8D9C-245F156E0F43}.webp',
    subCategories: [
      {
        name: '呐喊者·贴纸',
        image: '/image/贴纸/呐喊者/acb4827dc1e6aaa38abc7b2fbf58d97f_720.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波图形为核心设计，靛蓝色调展现信息穿透的力量。',
        history: '贴纸设计传递呐喊者的声音，象征不屈的抗战精神。',
        material: '优质PVC材料，防水耐用。',
        size: '10cm × 10cm',
        features: '采用彩色印刷工艺，色彩鲜艳，不易褪色，可重复粘贴。'
      },
      {
        name: '燃灯者·贴纸',
        image: '/image/贴纸/燃灯者/56f6470b8aecca9edaf66bf1b623e17d_720.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布图形为核心设计，赭红色调展现仪式维持的力量。',
        history: '贴纸设计传递燃灯者的坚守，象征不灭的文化灯火。',
        material: '优质PVC材料，防水耐用。',
        size: '10cm × 10cm',
        features: '采用彩色印刷工艺，色彩鲜艳，不易褪色，可重复粘贴。'
      },
      {
        name: '织网者·贴纸',
        image: '/image/贴纸/织网者/ea3b1c7d1b9cd078337983c11971a3d4_720.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网图形为核心设计，青绿色调展现关系编织的力量。',
        history: '贴纸设计传递织网者的团结精神，象征凝聚的力量。',
        material: '优质PVC材料，防水耐用。',
        size: '10cm × 10cm',
        features: '采用彩色印刷工艺，色彩鲜艳，不易褪色，可重复粘贴。'
      },
      {
        name: '摆渡者·贴纸',
        image: '/image/贴纸/摆渡者/3b99e08230fb160a17c1873c4ee359d5.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸纸船图形为核心设计，明黄色调展现路径重构的力量。',
        history: '贴纸设计传递摆渡者的智慧，象征灵活应变的精神。',
        material: '优质PVC材料，防水耐用。',
        size: '10cm × 10cm',
        features: '采用彩色印刷工艺，色彩鲜艳，不易褪色，可重复粘贴。'
      },
      {
        name: '潜火者·贴纸',
        image: '/image/贴纸/潜火者/c594e10743b2f2b3e7c3b5fe8f4e9f5e_720.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点图形为核心设计，墨黑色调展现能量隐匿的力量。',
        history: '贴纸设计传递潜火者的精神，象征隐忍中的坚持。',
        material: '优质PVC材料，防水耐用。',
        size: '10cm × 10cm',
        features: '采用彩色印刷工艺，色彩鲜艳，不易褪色，可重复粘贴。'
      }
    ]
  },
  {
    name: '磁吸贴',
    image: '/image/磁吸贴分类总览图/{D9E52198-4E52-4F8F-AC0C-7D2B318C2358}.webp',
    thumbImage: '/image-thumb/磁吸贴分类总览图/{D9E52198-4E52-4F8F-AC0C-7D2B318C2358}.webp',
    subCategories: [
      {
        name: '呐喊者·磁吸贴',
        image: '/image/磁吸贴/呐喊者/6cc36a9024d5550fdcb19b5b890e2af6.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波刺破云层为核心图形，展现信息穿透的力量。',
        history: '磁吸贴设计传递呐喊者的声音，象征不屈的抗战精神。',
        material: '优质软磁材质，粘性强，不易脱落。',
        size: '8cm × 8cm',
        features: '采用彩色印刷工艺，色彩鲜艳，图案清晰，磁力持久。'
      },
      {
        name: '燃灯者·磁吸贴',
        image: '/image/磁吸贴/燃灯者/7b68fcbbef97995a09e13bb2ceaff29d.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布交织为核心图形，展现文化守护的坚持。',
        history: '磁吸贴设计传递燃灯者的精神，象征不屈的文化坚守。',
        material: '优质软磁材质，粘性强，不易脱落。',
        size: '8cm × 8cm',
        features: '采用彩色印刷工艺，色彩鲜艳，图案清晰，磁力持久。'
      },
      {
        name: '织网者·磁吸贴',
        image: '/image/磁吸贴/织网者/e74c0d8814b5a7a385f5dc540d252e84.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网为核心图形，展现统一战线的团结。',
        history: '磁吸贴设计传递织网者的精神，象征紧密的团结与联络。',
        material: '优质软磁材质，粘性强，不易脱落。',
        size: '8cm × 8cm',
        features: '采用彩色印刷工艺，色彩鲜艳，图案清晰，磁力持久。'
      },
      {
        name: '摆渡者·磁吸贴',
        image: '/image/磁吸贴/摆渡者/5b50c739dcad6237b869f03d8b0551b8_720.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸折成纸船为核心图形，展现灵活应变的智慧。',
        history: '磁吸贴设计传递摆渡者的精神，象征不屈的适应力。',
        material: '优质软磁材质，粘性强，不易脱落。',
        size: '8cm × 8cm',
        features: '采用彩色印刷工艺，色彩鲜艳，图案清晰，磁力持久。'
      },
      {
        name: '潜火者·磁吸贴',
        image: '/image/磁吸贴/潜火者/8649cca4b29073fb9fc8d62c819e444e.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点为核心图形，展现隐忍待发的精神。',
        history: '磁吸贴设计传递潜火者的精神，象征不灭的信念之火。',
        material: '优质软磁材质，粘性强，不易脱落。',
        size: '8cm × 8cm',
        features: '采用彩色印刷工艺，色彩鲜艳，图案清晰，磁力持久。'
      }
    ]
  },
  {
    name: '挂绳',
    image: '/image/挂绳分类总览图/{93721030-0294-4397-BF5D-5FC99BC65471}.webp',
    thumbImage: '/image-thumb/挂绳分类总览图/{93721030-0294-4397-BF5D-5FC99BC65471}.webp',
    subCategories: [
      {
        name: '呐喊者·挂绳',
        image: '/image/挂绳/呐喊者/37a528cfa35c36e72e065c292a987afb_720.webp',
        description: '在信息封锁中撕开缺口，信息穿透',
        meaning: '以声波刺破云层为核心图形，靛蓝色调展现信息穿透的力量。',
        history: '挂绳设计传递呐喊者的声音，象征不屈的抗战精神。',
        material: '优质尼龙材质，耐磨耐用。',
        size: '宽2cm，长90cm',
        features: '采用热转印工艺，色彩鲜艳，图案清晰，金属扣环配件。'
      },
      {
        name: '燃灯者·挂绳',
        image: '/image/挂绳/燃灯者/4c405f97b2c5b0ade6839c1bb46a26ff_720.webp',
        description: '在混乱/溃散中维持仪式，维持',
        meaning: '以时钟与幕布交织为核心图形，赭红色调展现仪式维持的力量。',
        history: '挂绳设计传递燃灯者的坚守，象征不灭的文化灯火。',
        material: '优质尼龙材质，耐磨耐用。',
        size: '宽2cm，长90cm',
        features: '采用热转印工艺，色彩鲜艳，图案清晰，金属扣环配件。'
      },
      {
        name: '织网者·挂绳',
        image: '/image/挂绳/织网者/fd748e59056dbda462e0378fed72bb0a_720.webp',
        description: '在割裂/猜忌中编织关系，关系编织',
        meaning: '以节点连线成网为核心图形，青绿色调展现关系编织的力量。',
        history: '挂绳设计传递织网者的团结精神，象征凝聚的力量。',
        material: '优质尼龙材质，耐磨耐用。',
        size: '宽2cm，长90cm',
        features: '采用热转印工艺，色彩鲜艳，图案清晰，金属扣环配件。'
      },
      {
        name: '摆渡者·挂绳',
        image: '/image/挂绳/摆渡者/5278d6939f143f064dbcaa4ad01ea273_720.webp',
        description: '在道路受阻时另寻新途，路径重构',
        meaning: '以报纸纸船为核心图形，明黄色调展现路径重构的力量。',
        history: '挂绳设计传递摆渡者的智慧，象征灵活应变的精神。',
        material: '优质尼龙材质，耐磨耐用。',
        size: '宽2cm，长90cm',
        features: '采用热转印工艺，色彩鲜艳，图案清晰，金属扣环配件。'
      },
      {
        name: '潜火者·挂绳',
        image: '/image/挂绳/潜火者/922d10948af55dd166a096a36ebb2e95_720.webp',
        description: '在严峻环境下保存火种，能量隐匿',
        meaning: '以冻土下藏光点为核心图形，墨黑色调展现能量隐匿的力量。',
        history: '挂绳设计传递潜火者的精神，象征隐忍中的坚持。',
        material: '优质尼龙材质，耐磨耐用。',
        size: '宽2cm，长90cm',
        features: '采用热转印工艺，色彩鲜艳，图案清晰，金属扣环配件。'
      }
    ]
  }
]

// 系列主题数据
const themes = [
  {
    name: '呐喊者',
    description: '在信息封锁中撕开缺口',
    thing: '1944真实锚点:《救亡日报》在轰炸中坚持手摇印刷、出版发声；中共开展对敌宣传与舆论斗争',
    speak: '当真相需要被说出时，你愿意发声吗？'
  },
  {
    name: '燃灯者',
    description: '在混乱/溃散中维持仪式',
    thing: '1944真实锚点:西南剧展在时局紧张情况下如期举办，近百场演出坚守文化救亡阵地',
    speak: '当黑暗蔓延时，你是否愿意守住一束光？'
  },
  {
    name: '织网者',
    description: '在割裂/猜忌中编织关系',
    thing: '1944真实锚点:中共主导统一战线，联络各界进步人士，凝聚千余名文化力量共赴国难',
    speak: '当孤立无援时，你能否把分散的人连接起来？'
  },
  {
    name: '摆渡者',
    description: '在道路受阻时另寻新途',
    thing: '1944真实锚点:桂林沦陷后，地下党员在昭平创办《广西日报》（昭平版），转移阵地继续战斗',
    speak: '当道路中断时，你会不会为信息寻找另一条路？'
  },
  {
    name: '潜火者',
    description: '在严峻环境下保存火种',
    thing: '1944真实锚点:中共广西省工委领导的临阳联队，从基层武装发展为坚强敌后抗日力量',
    speak: '当不能高举旗帜时，你敢不敢把火种藏进沉默里？'
  }
]

const selectMainCategory = (index: number) => {
  if (selectedMainCategory.value === index) return
  transitioning.value = true
  selectedMainCategory.value = index
  // 重置轮播索引
  currentProductIndex.value = 0
  prefetchCategoryImages(index)
  nextTick(() => {
    setTimeout(() => { transitioning.value = false }, 50)
  })
}

const prefetchCategoryImages = (index: number) => {
  const cat = mainCategories[index]
  if (!cat) return
  cat.subCategories.forEach((sub: any) => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.as = 'image'
    link.href = sub.image
    document.head.appendChild(link)
  })
}

// 轮播方法
const prevProduct = () => {
  if (currentProductIndex.value > 0) {
    currentProductIndex.value--
    isSliding.value = true
    setTimeout(() => { isSliding.value = false }, 300)
  }
}

const nextProduct = () => {
  if (selectedMainCategory.value !== -1) {
    const subCategories = mainCategories[selectedMainCategory.value].subCategories
    if (currentProductIndex.value < subCategories.length - 1) {
      currentProductIndex.value++
      isSliding.value = true
      setTimeout(() => { isSliding.value = false }, 300)
    }
  }
}

const goToProduct = (index: number) => {
  currentProductIndex.value = index
  isSliding.value = true
  setTimeout(() => { isSliding.value = false }, 300)
}

// 触摸事件处理
const touchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const touchMove = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
}

const touchEnd = () => {
  const threshold = 50
  if (touchEndX.value < touchStartX.value - threshold) {
    // 向左滑动
    nextProduct()
  } else if (touchEndX.value > touchStartX.value + threshold) {
    // 向右滑动
    prevProduct()
  }
  touchStartX.value = 0
  touchEndX.value = 0
}

onMounted(() => {
  if (selectedMainCategory.value === -1) {
    mainCategories[0].subCategories.forEach((sub: any) => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = sub.image
      document.head.appendChild(link)
    })
  }
})

// 选择产品查看详情
const selectProduct = (product: any) => {
  selectedProduct.value = product
}

// 关闭产品详情
const closeDetail = () => {
  selectedProduct.value = null
}

// 放大查看图片
const zoomImage = () => {
  isZooming.value = true
}

// 关闭图片放大
const closeZoom = () => {
  isZooming.value = false
}
</script>

<style scoped>
/* 全局样式 */
.container {
  width: 100%;
  overflow-x: hidden;
  background-color: #F5F0E6;
}

/* 首页头图Banner区域 */
.banner {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  filter: brightness(0.7);
  object-fit: cover;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding: 0 20px;
}

.banner-title {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 3.5rem;
  font-weight: bold;
  color: #D4AF37;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  margin-bottom: 20px;
}

.banner-subtitle {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1.8rem;
  color: #F5F0E6;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.banner-intro {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 1rem;
  color: #F5F0E6;
  line-height: 1.5;
  max-width: 800px;
  margin: 0 auto 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 项目理念内容 */
.banner-concept {
  max-width: 600px;
  margin: 0 auto 30px;
  text-align: center;
}

.banner-concept-text {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 0.9rem;
  color: #D4AF37;
  line-height: 1.6;
  margin: 8px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-weight: 500;
}

/* 分隔线 */
.banner-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 400px;
}

.banner-divider::before,
.banner-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  margin: 0 20px;
}

.divider-star {
  font-size: 1.2rem;
  color: #D4AF37;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 主标语 */
.banner-motto {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 0.95rem;
  color: #F5F0E6;
  line-height: 1.4;
  max-width: 700px;
  margin: 20px auto 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-style: italic;
}

/* 印章 */
.banner-stamp {
  display: inline-block;
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1.1rem;
  color: #D4AF37;
  font-weight: bold;
  padding: 8px 16px;
  border: 2px solid #D4AF37;
  border-radius: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  margin-top: 10px;
  letter-spacing: 2px;
}

/* Banner装饰元素 */
.banner-decoration {
  position: absolute;
  z-index: 2;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(212, 175, 55, 0.5);
}

.banner-decoration.top-left {
  top: 30px;
  left: 30px;
  border-right: none;
  border-bottom: none;
}

.banner-decoration.top-right {
  top: 30px;
  right: 30px;
  border-left: none;
  border-bottom: none;
}

.banner-decoration.bottom-left {
  bottom: 30px;
  left: 30px;
  border-right: none;
  border-top: none;
}

.banner-decoration.bottom-right {
  bottom: 30px;
  right: 30px;
  border-left: none;
  border-top: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner {
    height: auto;
    min-height: 100vh;
    padding: 60px 20px;
  }
  
  .banner-title {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
  
  .banner-subtitle {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }
  
  .banner-intro {
    font-size: 0.9rem;
    margin-bottom: 20px;
  }
  
  .banner-concept {
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .banner-concept-text {
    font-size: 0.8rem;
    margin: 6px 0;
  }
  
  .banner-divider {
    max-width: 300px;
    margin: 15px auto;
  }
  
  .banner-divider::before,
  .banner-divider::after {
    margin: 0 15px;
  }
  
  .banner-motto {
    font-size: 0.85rem;
    margin: 15px auto 20px;
  }
  
  .banner-stamp {
    font-size: 0.9rem;
    padding: 6px 12px;
  }
  
  .banner-decoration {
    width: 60px;
    height: 60px;
  }
  
  .banner-decoration.top-left,
  .banner-decoration.top-right {
    top: 20px;
  }
  
  .banner-decoration.bottom-left,
  .banner-decoration.bottom-right {
    bottom: 20px;
  }
  
  .banner-decoration.top-left,
  .banner-decoration.bottom-left {
    left: 20px;
  }
  
  .banner-decoration.top-right,
  .banner-decoration.bottom-right {
    right: 20px;
  }
}

@media (max-width: 480px) {
  .banner {
    padding: 40px 15px;
  }
  
  .banner-title {
    font-size: 2rem;
  }
  
  .banner-subtitle {
    font-size: 1.2rem;
  }
  
  .banner-intro {
    font-size: 0.8rem;
  }
  
  .banner-concept-text {
    font-size: 0.75rem;
  }
  
  .banner-motto {
    font-size: 0.8rem;
  }
  
  .banner-stamp {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
  
  .banner-decoration {
    width: 40px;
    height: 40px;
    border-width: 2px;
  }
  
  .banner-decoration.top-left,
  .banner-decoration.top-right {
    top: 15px;
  }
  
  .banner-decoration.bottom-left,
  .banner-decoration.bottom-right {
    bottom: 15px;
  }
  
  .banner-decoration.top-left,
  .banner-decoration.bottom-left {
    left: 15px;
  }
  
  .banner-decoration.top-right,
  .banner-decoration.bottom-right {
    right: 15px;
  }
}



/* 产品分类展示区域 */
.product-category {
  padding: 80px 20px;
  background: linear-gradient(180deg, #fff 0%, #F5F0E6 100%);
}

.section-title {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 2.5rem;
  color: #8B4513;
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  margin: 15px auto 0;
}

.category-container {
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 侧边导航栏 */
.sidebar {
  width: 100%;
  background: linear-gradient(180deg, #8B4513 0%, #6B3410 100%);
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.2);
}

.sidebar::-webkit-scrollbar {
  height: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 100px;
  max-width: 120px;
  flex: 1;
  min-height: 120px;
  justify-content: center;
  white-space: nowrap;
}

.sidebar-item:hover,
.sidebar-item.active {
  background: rgba(255, 255, 255, 0.15);
}

.sidebar-image {
  width: 100%;
  max-width: 70px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 6px;
  border: none;
  background: transparent;
  display: block;
  flex-shrink: 0;
}

.sidebar-name {
  font-family: '思源黑体', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 0.9rem;
  font-weight: bold;
  color: #F5F0E6;
  text-align: center;
  line-height: 1.2;
  word-wrap: break-word;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 40px;
  background: linear-gradient(135deg, #F5F0E6 0%, #fff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 500px;
  padding: 20px;
}

.welcome-text {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1.5rem;
  color: #8B4513;
  margin-bottom: 20px;
  text-align: center;
}

.welcome-image-container {
  width: 100%;
  max-width: 800px;
  height: 400px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  background: #f0ebe0;
}

.welcome-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  background: #f0ebe0;
}

/* 产品轮播 */
.product-carousel {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: pan-x;
}

.carousel-slide {
  display: flex;
  transition: transform 0.3s ease;
  will-change: transform;
}

.carousel-slide.transition {
  transition: transform 0.3s ease;
}

.carousel-item {
  flex: 0 0 100%;
  padding: 20px;
}

.carousel-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f9f5f0;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  background: #f0ebe0;
  overflow: hidden;
  border-radius: 10px;
  margin-bottom: 20px;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e8e0d0 25%, #f0ebe0 50%, #e8e0d0 75%);
  background-size: 200% 200%;
  animation: shimmer 1.5s ease-in-out infinite;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.image-placeholder.hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.sub-category-image {
  width: 100%;
  height: 300px;
  object-fit: contain;
  background: #fff;
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 10px;
}

.sub-category-image.loaded {
  opacity: 1;
}

.sub-category-name {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1.5rem;
  color: #8B4513;
  margin: 20px 0 15px;
  font-weight: bold;
}

.sub-category-description {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1rem;
  color: #6B4226;
  margin: 0 0 20px;
  line-height: 1.6;
  max-width: 500px;
}

.view-details-btn {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* 轮播控制容器 */
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* 轮播控制按钮 */
.carousel-btn {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  border: 1px solid #D4AF37;
  border-radius: 25px;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

.carousel-btn:hover {
  background: #B8860B;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.carousel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-btn:disabled:hover {
  background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
  transform: none;
  box-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

/* 导航指示器 */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e8e0d0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #D4AF37;
  transform: scale(1.2);
}

.indicator:hover {
  background: #B8860B;
}

/* 页码信息 */
.carousel-pagination {
  text-align: center;
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1rem;
  color: #8B4513;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .carousel-item-content {
    padding: 20px;
  }
  
  .image-wrapper {
    height: 250px;
  }
  
  .sub-category-image {
    height: 250px;
  }
  
  .sub-category-name {
    font-size: 1.3rem;
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .carousel-item {
    padding: 10px;
  }
  
  .carousel-item-content {
    padding: 15px;
  }
  
  .image-wrapper {
    height: 200px;
  }
  
  .sub-category-image {
    height: 200px;
  }
  
  .sub-category-name {
    font-size: 1.1rem;
  }
  
  .sub-category-description {
    font-size: 0.9rem;
  }
  
  .view-details-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .carousel-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .carousel-indicators {
    gap: 8px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
}

/* 单个产品详情展示区域 */
.product-detail {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.detail-content {
  background-color: #F5F0E6;
  border-radius: 15px;
  padding: 40px;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-image {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 10px;
  margin-bottom: 30px;
  cursor: zoom-in;
  transition: all 0.3s ease;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.detail-image:hover {
  transform: scale(1.02);
}

.detail-info {
  width: 100%;
  text-align: left;
}

.detail-name {
  font-family: '思源黑体', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.8rem;
  font-weight: bold;
  color: #8B4513;
  margin-bottom: 25px;
  text-align: center;
}

.detail-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border-left: 4px solid #D4AF37;
}

.detail-section-title {
  font-family: '思源黑体', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.2rem;
  font-weight: bold;
  color: #8B4513;
  margin-bottom: 10px;
  display: block;
}

.detail-meaning,
.detail-history,
.detail-material,
.detail-size,
.detail-features {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 1rem;
  color: #000080;
  line-height: 1.6;
}

.detail-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: #8B0000;
  padding: 12px 25px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
}

.detail-close:hover {
  background-color: #6B0000;
  transform: scale(1.05);
}

/* 图片放大查看区域 */
.image-zoom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.zoom-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  cursor: zoom-out;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.zoom-close {
  position: absolute;
  top: 20px;
  right: 20px;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: #8B0000;
  padding: 12px 25px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
}

.zoom-close:hover {
  background-color: #6B0000;
  transform: scale(1.05);
}

/* 系列主题整合区域 */
.themes {
  padding: 60px 20px;
  background: linear-gradient(180deg, #F5F0E6 0%, #fff 100%);
  position: relative;
}

.themes::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4513' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: 0;
}

.theme-timeline {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.theme-timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #D4AF37, #8B4513, #D4AF37);
  transform: translateX(-50%);
}

.theme-item {
  display: flex;
  margin-bottom: 30px;
  position: relative;
}

.theme-dot {
  position: absolute;
  left: 50%;
  top: 20px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #D4AF37, #8B4513);
  border-radius: 50%;
  transform: translateX(-50%);
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.5);
}

.theme-item:hover .theme-dot {
  transform: translateX(-50%) scale(1.3);
  box-shadow: 0 0 25px rgba(212, 175, 55, 0.8);
}

.theme-content {
  width: 45%;
  background: linear-gradient(135deg, #fff 0%, #F5F0E6 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.theme-item:hover .theme-content {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.theme-item:nth-child(even) .theme-content {
  margin-left: auto;
}

.theme-name {
  font-family: '思源黑体', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 1.6rem;
  font-weight: bold;
  color: #8B4513;
  margin-bottom: 10px;
}

.theme-desc {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 1.1rem;
  color: #000080;
  line-height: 1.5;
  margin-bottom: 10px;
}

.theme-geography {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 1rem;
  color: #8B4513;
  line-height: 1.5;
  margin-bottom: 15px;
}

.theme-color {
  font-family: '思源宋体', 'Noto Serif SC', 'SimSun', serif;
  font-size: 1.4rem;
  font-weight: bold;
  color: #8B0000;
  line-height: 1.6;
  font-style: italic;
}

/* 结尾展示区域 */
.ending {
  padding: 60px 20px;
  background: linear-gradient(180deg, #fff 0%, #F5F0E6 50%, #fff 100%);
  text-align: center;
  position: relative;
}

.ending-title {
  font-family: '楷体', 'STKaiti', 'KaiTi', serif;
  font-size: 2rem;
  font-weight: bold;
  color: #8B0000;
  margin-bottom: 20px;
  line-height: 1.5;
  text-shadow: 2px 2px 4px rgba(139, 0, 0, 0.2);
}

.ending-info {
  font-family: '微软雅黑', 'Microsoft YaHei', 'PingFang SC', Arial, sans-serif;
  font-size: 0.9rem;
  color: #8B4513;
}

/* 结尾装饰 */
.ending-decoration {
  position: absolute;
  width: 150px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8B0000, transparent);
  top: 50%;
}

.ending-decoration.left {
  left: 10%;
}

.ending-decoration.right {
  right: 10%;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .category-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    display: flex;
    overflow-x: auto;
    padding: 10px;
  }

  .sidebar-item {
    flex-direction: row;
    padding: 10px 15px;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sidebar-image {
    width: 40px;
    height: 40px;
    margin-bottom: 0;
    margin-right: 10px;
  }

  .theme-timeline::before {
    left: 20px;
  }

  .theme-dot {
    left: 20px;
  }

  .theme-content {
    width: calc(100% - 60px);
    margin-left: 60px !important;
  }
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 2.5rem;
  }

  .banner-subtitle {
    font-size: 1.5rem;
  }

  .banner-intro {
    font-size: 0.9rem;
  }

  .concept-title,
  .section-title {
    font-size: 2rem;
  }

  .concept-text {
    font-size: 1rem;
  }

  .sub-category-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .detail-content {
    padding: 20px;
  }

  .ending-title {
    font-size: 1.5rem;
  }

  .banner-decoration {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 2rem;
  }

  .banner-subtitle {
    font-size: 1.2rem;
  }

  .concept-title,
  .section-title {
    font-size: 1.8rem;
  }

  .theme-content {
    padding: 20px;
  }

  .theme-name {
    font-size: 1.2rem;
  }

  .ending-title {
    font-size: 1.3rem;
  }
}
</style>