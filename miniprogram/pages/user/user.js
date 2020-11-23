// miniprogram/pages/user/user.js
   const app=getApp()
   const db=wx.cloud.database()
Page({

  data: {
    userPhoto :"../../images/user/用户_wps图片.png",
    nickName : "皮老板",
    logged :false,
    disabled :true
  },
  onShow : function(){
    this.setData({
      userPhoto : app.userInfo.userPhoto,
      nickName :app.userInfo.nickName,
      id : app.userInfo._id
    });
  },
  onReady: function(){

    this.getLocation();

    wx.cloud.callFunction({
      name : 'login',
      data : {}
    }).then((res)=>{
      //console.log(res);
      db.collection('users').where({
        _openid : res.result.openid
      }).get().then((res)=>{
        if( res.data.length ){
          app.userInfo = Object.assign(app.userInfo, res.data[0]);
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            id : app.userInfo._id
          });
          this.getMessage();
        }
        else{
          this.setData({
            disabled : false
          });
        }
      });
    });
  },
  bindGetUserInfo(ev){
    //console.log(ev);
    let userInfo = ev.detail.userInfo;
    if( !this.data.logged && userInfo ){
      db.collection('users').add({
        data : {
          userPhoto: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          signature : '',
          phoneNumber : '',
          weixinNumber : '',
          links : 0,
          time : new Date(),
          isLocation : true,
          longitude: this.longitude,
          latitude: this.latitude,
          location: db.Geo.Point(this.longitude, this.latitude),
          friendList : []
        }
      }).then((res)=>{
         db.collection('users').doc(res._id).get().then((res)=>{
           console.log(res.data);
           app.userInfo = Object.assign( app.userInfo , res.data );
           this.setData({
             userPhoto : app.userInfo.userPhoto,
             nickName : app.userInfo.nickName,
             logged : true,
             id: app.userInfo._id
           });
         });
      });
    }
 },
  getMessage(){
    db.collection('message').where({
      userId : app.userInfo._id
    }).watch({
      onChange: function (snapshot) {
        if ( snapshot.docChanges.length ){
          let list = snapshot.docChanges[0].doc.list;
          if( list.length ){
            wx.showTabBarRedDot({
              index: 2
            });
            app.userMessage = list;
          }
          else{
            wx.hideTabBarRedDot({
              index: 2
            })
            app.userMessage = [];
          }
        }
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    });
  },
  getLocation(){
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.latitude = res.latitude
        this.longitude = res.longitude
      }
    })
  }
})