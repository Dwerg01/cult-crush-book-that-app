      var valuesGrid = document.querySelectorAll('.product-values .product-value--content');
      var height = 0;
      if(valuesGrid.length > 1){
        setTimeout(function(){
          valuesGrid.forEach(function(item, i){
            if(height < item.offsetHeight){
              height = item.offsetHeight;
            }
          });
          valuesGrid.forEach(function(item, i){
            item.style.height = height + 'px';
          });
        }, 100);    
      }