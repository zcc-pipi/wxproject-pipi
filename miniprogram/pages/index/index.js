//index.js
const app = getApp()
const db =wx.cloud.database()

Page({
  data: {
    
    imgUrls: [],
  listData : [],
  current : 'links'
  },
  onReady: function(){
   this.getListData();
   this.getBannerList();
  },
  handlelinks(ev){
    let id = ev .target.dataset.id;
    
    wx.cloud.callFunction({
      name :'update',
      data :{
        collection : 'users',
        doc :id,
        data :"{links :_.inc(1)}"
      }
    }).then((res)=>{
      let  updated =res.result.stats.updated;
      if(updated){
       let cloneListDate=[...this.data.listData];
        for(let i=0; i< cloneListDate.length ; i++){
          if(cloneListDate[i]._id==id){
            cloneListDate[i].links++;
          }
        }
        this.setData({
          listData : cloneListDate
        });
      }
    });
     
  },
  handleCurrent(ev){
    let current =ev.target.dataset.current;
    if(current==this.data.current){
      return false;
    }
    this.setData({
      current
    });
    this.getListData({
      current
    },()=>{
      this.getListData();
    });
  },
  getListData(){
    db.collection('users')
    .field({
      userPhoto : true,
      nickName : true,
      links :  true
    })
    .orderBy(this.data.current,'desc')
    .get()
    .then((res)=>{
       this.setData({
         listData : res.data
       });
    });
  },
  handleDetaill(ev){
    let id=ev.target.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/detail?userId='+id
    })
  },
  getBannerList(){
    db.collection('banner').get().then((res)=>{
      
      this.setData({
        imgUrls : res.data
      });
    });
  }
})