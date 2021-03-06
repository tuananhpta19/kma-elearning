/**
 * Created by https://trungquandev.com's author on 25/02/2018.
 */
 function nineScrollLeft() {
    $('.left').niceScroll({
      smoothscroll: true,
      horizrailenabled: false,
      cursorcolor: '#ECECEC',
      cursorwidth: '7px',
      scrollspeed: 50
    });
  }
  
  // function nineScrollRight() {
  //   $('.right .chat').niceScroll({
  //     smoothscroll: true,
  //     horizrailenabled: false,
  //     cursorcolor: '#ECECEC',
  //     cursorwidth: '7px',
  //     scrollspeed: 50
  //   });
  //   $('.right .chat').scrollTop($('.right .chat')[0].scrollHeight);
  // }
  

  
  function spinLoaded() {
    $('#loader').css('display', 'none');
  }
  
  function spinLoading() {
    $('#loader').css('display', 'block');
  }
  
  function ajaxLoading() {
    $(document)
      .ajaxStart(function() {
        spinLoading();
      })
      .ajaxStop(function() {
        spinLoaded();
      });
  }
  
  function showModalContacts() {
    $('#show-modal-contacts').click(function() {
      $(this).find('.noti_contact_counter').fadeOut('slow');
    });
  }
  
  function configNotification() {
    $('#noti_Button').click(function() {
      $('#notifications').fadeToggle('fast', 'linear');
      $('.noti_counter').fadeOut('slow');
      return false;
    });
    $(document).click(function() {
      $('#notifications').fadeOut('fast', 'linear');
    });
  }
  
 
  
  function showButtonGroupChat() {
    $('#select-type-chat').bind('change', function() {
      if ($(this).val() === 'group-chat') {
        $('.create-group-chat').show();
        // Do something...
      } else {
        $('.create-group-chat').hide();
      }
    });
  }
  
  function addFriendsToGroup() {
    $('ul#group-chat-friends').find('div.add-user').bind('click', function() {
      let uid = $(this).data('uid');
      $(this).remove();
      let html = $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').html();
  
      let promise = new Promise(function(resolve, reject) {
        $('ul#friends-added').append(html);
        $('#groupChatModal .list-user-added').show();
        resolve(true);
      });
      promise.then(function(success) {
        $('ul#group-chat-friends').find('div[data-uid=' + uid + ']').remove();
      });
    });
  }
  
  function cancelCreateGroup() {
    $('#cancel-group-chat').bind('click', function() {
      $('#groupChatModal .list-user-added').hide();
      if ($('ul#friends-added>li').length) {
        $('ul#friends-added>li').each(function(index) {
          $(this).remove();
        });
      }
    });
  }
  function flashMasterNotify(){
    let notify= $(".master-success-message").text();
    if(notify.length){
      alertify.notify(notify, 'success', 7 )
    }
  }
  $(document).ready(function() {
    // Hide s??? th??ng b??o tr??n ?????u icon m??? modal contact
    showModalContacts();
  
    // B???t t???t popup notification
    configNotification();
  
    // C???u h??nh thanh cu???n
    nineScrollLeft();
    // nineScrollRight();
  
    // B???t emoji, tham s??? truy???n v??o l?? id c???a box nh???p n???i dung tin nh???n
  
    // Icon loading khi ch???y ajax
    ajaxLoading();
  
    // Hi???n th??? button m??? modal t???o nh??m tr?? chuy???n
    showButtonGroupChat();
  
    // Hi???n th??? h??nh ???nh grid slide trong modal t???t c??? ???nh, tham s??? truy???n v??o l?? s??? ???nh ???????c hi???n th??? tr??n 1 h??ng.
    // Tham s??? ch??? ???????c ph??p trong kho???ng t??? 1 ?????n 5
    // Th??m ng?????i d??ng v??o danh s??ch li???t k?? tr?????c khi t???o nh??m tr?? chuy???n
    addFriendsToGroup();
  
    // Action h???y vi???c t???o nh??m tr?? chuy???n
    cancelCreateGroup();
    //Flash message ??? m??n h??nh master
    flashMasterNotify();
  });
  