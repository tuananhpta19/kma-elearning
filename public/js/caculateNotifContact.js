function increaseNumberNotification(className){
    let currentValue = $(`${className}`).text();
    currentValue += 1;
    if(currentValue === 0){
        $(`${className}`).css("display", "none").html("")
    }else{
        //hiển thị số lượng thẻ thông báo
        $(`${className}`).css("display", "block").html(`(${currentValue}`)
    }
}

function decreaseNumberNotification(className){
    let currentValue = $(`${className}`).text();
    currentValue += 1;
    if(currentValue === 0){
        $(`${className}`).css("display", "none").html("")
    }else{
        //hiển thị số lượng thẻ thông báo
        $(`${className}`).css("display", "block").html(`${currentValue}`)
    }
}