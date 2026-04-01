
$(function(){

	// 예약자명 무통장입금 예금주명으로 자동 등록
    $('#guest_name').on('input', function(){
        $('#accountHolder').val($(this).val());
    });
    
    // 인원추가 제어
    $('.add_pax').on('change',function(){
		const $this		= $(this)
		const max		= $this.find('option:last').val();
		let cnt			= 0;  
		
		$('.add_pax').each(function(){ cnt += strToInt($(this).val());});
		
		if(max < cnt){
			alert('최대 추가인원이 조과 되었습니다.');
			$this.find('option:eq(0)').prop('selected',true);
			return false;
		}
		
		calcFinalAmt();
	});
    
	// 바비큐 추가 체크박스 제어
	$('#barbecueTypeChk').on('click',function(){
		const $form		= $('#resvForm');
		const $bType	= $form.find('select[name=barbecue_type]');
		const $bPart	= $form.find('select[name=barbecue_part]');
		let isUnchecked = !$(this).is(':checked');
		// let bool		= $(this).is(':checked') ? false : true;
		
		$bType.prop('disabled', isUnchecked);
		$bPart.prop('disabled', isUnchecked);
		// $bType.prop('disabled',bool);
		// $bPart.prop('disabled',bool);

		if (isUnchecked) {
    $bType.val("");
    $bPart.val("");
    calcFinalAmt(); 
  }
		// if(bool){
		// 	$bType.find('option:eq(0)').prop('selected',true);
		// 	$bPart.find('option:eq(0)').prop('selected',true);
		// }
	});

	$('#barbecueType').on('change',function(){
		$('#barbecuePart').find('option:eq(0)').prop('selected',true);
	});
	$('#barbecuePart').on('change',function(){
		if(nvl(this.value) != '' && nvl($('#barbecueType').val()) == ''){
			alert('바비큐 장소를 먼저 선택해 주세요.');
			$('#barbecuePart').find('option:eq(0)').prop('selected',true);
			$('#barbecueType').focus();
			return false;
		}
		calcFinalAmt();
	});
	
	// 침구류 추가 체크박스 제어
	$('#blanketChk').on('click', function() {
		let isUnchecked = !$(this).is(':checked');
		const $blanket = $('#resvForm').find('select[name=A03-BLANKET]');
		
		$blanket.prop('disabled', isUnchecked);
		
		if (isUnchecked) {
			$blanket.val(""); 
			calcFinalAmt(); 
		}
	});
	// $('#blanketChk').on('click',function(){
	// 	let bool	= $(this).is(':checked') ? false : true;
	// 	$('#resvForm').find('select[name=A03-BLANKET]').prop('disabled',bool);
	// });
	
	// $('#blanket').on('change',function(){
	// 	calcFinalAmt();
	// });
	
	// 모두동의
    $('#check-all').on('change', function(){
        $('.agree-check').prop('checked', this.checked);
    });	
    
    // 약관 동의 
	$('.agree-check').on('change', function(){
        const total		= $('.agree-check').length;
        const checked	= $('.agree-check:checked').length;
        $('#check-all').prop('checked', total === checked);
    });
	
	// 내용보기 토글 및 체크박스 로직
    $('.btn-view-terms').on('click', function(){
        const $content = $(this).closest('.agreement-item').find('.terms-content');
        $content.toggleClass('active');
        $(this).text($content.hasClass('active') ? '닫기' : '내용보기');
    });
	
	// 결제수단 선택    
    $('#resvForm').on('change',':radio[name=pay_method]', function(){
		if(nvl($(this).val()) === 'vbank'){
			$('#transferDiv').show();
			$('#transferDiv').find('input,select').prop('disabled',false);
		}else{
			$('#transferDiv').hide();
			$('#transferDiv').find('input,select').prop('disabled',true);
		}
    });
    
	// 다음단계 버튼 이벤트
	$('#resvNextAct').on('click',function(){
		const $form			= $('#resvForm');
		const guestName		= nvl($('#guest_name').val());
		let $guestPhone 	= $form.find('input[name="guest_phone"]');
		const guestPhone1	= nvl($form.find('[name=guest_phone1]').val());
		const guestPhone2	= nvl($form.find('[name=guest_phone2]').val());
		const guestPhone3	= nvl($form.find('[name=guest_phone3]').val());
		let guestPhone		= [guestPhone1,guestPhone2,guestPhone3].join('-');
		const barbecueChk	= $('#barbecueTypeChk').is(':checked');
		const barbecuePart	= nvl($('#barbecuePart').val());
		const blanketChk	= $('#blanketChk').is(':checked');
		const blanket		= nvl($('#blanket').val());
		const checkAll		= $('#check-all').is(':checked');
		const payMethod		= nvl($form.find('[name=pay_method]:checked').val());
		const bankCode		= nvl($form.find('[name=bank_code]').val());
		const accountNum	= nvl($form.find('[name=account_number]').val());
		
		calcFinalAmt();
		
		/* 예약자 정보 */
		if(guestName == ''){
			alert('예약자명은 필수 입력 사항입니다.');
			$('#guest_name').focus();
			return false;
		}
		if(guestPhone2 == '' || guestPhone2.length < 3){
			alert('연락처 중간자리는 필수 입력 사항입니다.');
			$form.find('[name=guest_phone2]').focus();
			return false;
		}
		if(guestPhone3 == '' || guestPhone3.length < 4){
			alert('연락처는 끝자리는 필수 입력 사항입니다.');
			$form.find('[name=guest_phone3]').focus();
			return false;
		}
		if($guestPhone.length > 0){
			$guestPhone.val(guestPhone);
		}else{
			$('<input>').attr({type:'hidden',name:'guest_phone'}).val(guestPhone).prependTo($form);
		}
		if(barbecueChk && barbecuePart == ''){
			alert('바비큐 이용 시간을 선택해주세요.');
			$('#barbecuePart').focus();
			return false;
		}
		if(blanketChk && blanket == ''){
			alert('침구류 추가 수량을 선택해주세요.');
			$('#blanket').focus();
			return false;
		}
		
		/* 약관 */
		if(!checkAll){
			let alertTxt	= '';
			$('.agreement-item').each(function(){
				const $t		= $(this);
				if(!$t.find(':checkbox').is(':checked')){
					let $s	= $t.find('.item-title span').clone();
					$s.find('small').remove();
					alertTxt	= $s.text();
					return false; 
				}
			});
			alert(alertTxt+' 항목의 약관을 동의 하셔야 합니다.');
			return false;
		}
		
		/* 결제 */
		if(payMethod == 'card'){			// 카드 결제
			// -- 카드 결제 내용 삽입
			alert('무통장입금만 가능합니다.');
			return false;
			
		}else if(payMethod == 'vbank'){	// 무통장입금
			if(bankCode == ''){
				alert('은행을 선택해 주세요');
				$form.find('[name=bank_code]').focus();
				return false;
			}
			if(accountNum == ''){
				alert('계좌번호를 작성해 주세요.');
				$form.find('[name=account_number]').focus();
				return false;
			}
		}
		
		$.ajax({
			url			: '/reservation/formAct'
			,type		: 'POST'
			,data		:  $form.serialize()			
			,dataType	: 'json'
            ,success	: function(data){
				const {status,message}	= data;
				
				if(nvl(status) == 'success'){
					const $form	= $('#resvForm');
					$('<input>').attr({type:'hidden',name:'reservation_id'}).val(data.reservation_id).prependTo($form);
					$form.submit();
					
				}else{
					alert(nvl(message));
				}
            }
            ,error		: function(xhr, status, error){
				ajaxError(xhr);
            }
        });	
	});
	
	calcFinalAmt();
});

function calcFinalAmt(){
	const $form				= $('#resvForm');
	const $addon			= $('#addonForm');
	const extraPplAmtAdults	= strToInt($addon.find(':hidden[name=A03-PERSON_ADULT]').val());	// 성인 추가금액
	const extraPplAmtChild	= strToInt($addon.find(':hidden[name=A03-PERSON_CHILD]').val());	// 아동 추가금액
	const extraBBQAmt		= strToInt($addon.find(':hidden[name=A03-BARBECUE]').val());		// 바비큐 추가금액
	const extraLinenAmt		= strToInt($addon.find(':hidden[name=A03-BLANKET]').val());			// 침구류 추가금액
	const addAdults			= nvl($('.add_pax[name=add_adults]').val());
	const addChidlren		= nvl($('.add_pax[name=add_chidlren]').val());
	const barbecueType		= nvl($('#barbecueType').val());
	const barbecuePart		= nvl($('#barbecuePart').val());
	const blanket			= nvl($('#blanket').val());
	let $resvAddon			= $form.find('input[name="resv_addon"]');
	let $finalPrice 		= $form.find('input[name="final_price"]');
	
	// 인원추가
	const bbb		= strToInt(addAdults)*extraPplAmtAdults;
	const bb		= strToInt(addChidlren)*extraPplAmtChild;
	const extraPpl	= formatComma(bbb+bb);
	$('#extraPersonPrice').text(extraPpl);
	
	// 부가서비스
	const isBbqChecked = $('#barbecueTypeChk').is(':checked');
	const isBlanketChecked = $('#blanketChk').is(':checked');

	// 체크박스가 꺼져있으면 무조건 0원, 켜져있을 때만 값 가져오기
	const ddd = (isBbqChecked && !isNull(barbecuePart)) ? extraBBQAmt : 0;
	const dd = (isBlanketChecked) ? (strToInt(blanket) * extraLinenAmt) : 0;

	let optSvc = formatComma(ddd + dd);
	$('#servicePrice').text(optSvc);

	// const ddd		= isNull(barbecuePart) ? 0 : extraBBQAmt;
	// const dd		= strToInt(blanket) * extraLinenAmt;
	// let optSvc		= formatComma(ddd+dd);
	// $('#servicePrice').text(optSvc);
	
	
	// resv_addon 저장 
	let resvAddonAry	= [];
	
	if(addAdults != '') resvAddonAry.push('A03-PERSON_ADULT:'+addAdults);
	if(addChidlren != '') resvAddonAry.push('A03-PERSON_CHILD:'+addChidlren);
	if(blanket != '') resvAddonAry.push('A03-BLANKET:'+blanket);
	if(barbecuePart != ''){
		resvAddonAry.push(barbecueType+':1');
		resvAddonAry.push(barbecuePart+':1');
	}
	if($resvAddon.length > 0){
		$resvAddon.val(resvAddonAry.join('|'));
	}else{
		$('<input>').attr({type:'hidden',name:'resv_addon'}).val(resvAddonAry.join('|')).prependTo($form);
	}
	
	// 할인금액
	const ccc		= strToInt($form.find(':hidden[name=base_price]').val()); 
	const cc		= strToInt($form.find(':hidden[name=discount_price]').val()); 
	let dcAmt		= formatComma(ccc-cc);
	$('#discountPrice').text('-'+dcAmt);
	
	// 최종금액
	let totalPrice	= cc+bbb+bb+ddd+dd;
	let finalPrice	= formatComma(totalPrice);
	$('#totalPrice').text(finalPrice);
	$finalPrice.val(totalPrice);
}

function ajaxError(xhr){
    let message	= "서버와 통신 중 알 수 없는 오류가 발생했습니다.";

    if(xhr.status === 0){
        message = "네트워크 연결을 확인해 주세요.";
    }else if(xhr.status == 400){
        message = "잘못된 요청입니다. (400)";
    }else if(xhr.status == 403){
        message = "접근 권한이 없습니다. (403)";
    }else if(xhr.status == 404){
        message = "요청하신 페이지를 찾을 수 없습니다. (404)";
    }else if(xhr.status == 500){
        message = "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. (500)";
    }else if(xhr.status == 401 || xhr.status == 302){		
        message = "세션이 만료되었습니다. 다시 로그인해 주세요.";
        location.href = "/login";
    }
    alert(message);
}

// 날짜를 YYYY.MM.DD 형식으로 변환하는 함수
function formatDate(date,fmt){
    if(!date) return "";
    if(!fmt) fmt = '.';
    const year	= date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day 	= String(date.getDate()).padStart(2, '0');
    
    return [year, month, day].join(fmt);
}

// 박수(Night) 계산 함수
function getDiffNights(start, end){
    if(!start || !end) return 0;
    const startDate = new Date(start);
    const endDate 	= new Date(end);
    if(isNaN(startDate) || isNaN(endDate)) return 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.floor(diffTime / 86400000);
}

function isNull(param){
	return (param === null || param === undefined || String(param).trim() === '');
}

function nvl(param){
    return isNull(param) ? '' : String(param).trim();
}

function strToNum(param){
	return nvl(param).replace(/[^0-9]/g,'');
}

function strToInt(param){
	var numStr = strToNum(param); 
    return numStr === '' ? 0 : parseInt(numStr, 10);
}

function formatComma(param){
    if(isNull(param)) return '0'; 
    const num = Number(strToNum(param)); 
    return num.toLocaleString('ko-KR');
}
