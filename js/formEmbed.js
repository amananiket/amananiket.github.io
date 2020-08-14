(function($) {
    var emailOctopus = {
        debug: window.location.href.indexOf('eoDebug=1') !== -1,
        successMessage: 'Done.',
        missingEmailAddressMessage: 'Your email address is required.',
        invalidEmailAddressMessage: 'Your email address looks incorrect, please try again.',
        botSubmissionErrorMessage: 'This doesn\'t look like a human submission.',
        invalidParametersErrorMessage: 'This form has missing or invalid fields.',
        unknownErrorMessage: 'Sorry, an unknown error has occurred. Please try again later.',
        isBotPost: function($form) {
            return $form.find('.email-octopus-form-row-hp input').val();
        },
        basicValidateEmail: function(email) {
            var regex = /\S+@\S+\.\S+/;
            return regex.test(email);
        },
        ajaxSuccess: function($form) {
            $form.trigger('email-octopus.success');
            var successRedirectUrl = $form.find('.email-octopus-success-redirect-url').val();
            if (successRedirectUrl && successRedirectUrl.trim()) {
                if (emailOctopus.debug) {
                    console.log('EmailOctopus: redirecting to ' + successRedirectUrl);
                }
                window.location.href = successRedirectUrl;
            } else {
                if (emailOctopus.debug) {
                    console.log('EmailOctopus: no redirect URL found, showing confirmation');
                }
                $(".email-octopus-success-message").text(emailOctopus.successMessage);
                $form.hide();
            }
        },
        ajaxError: function($form, textStatus) {
            var response = $.parseJSON(textStatus.responseText);
            var $errorMessage = $form.siblings('.email-octopus-error-message');
            if (response && response.error && response.error.code) {
                switch (response.error.code) {
                    case 'INVALID_PARAMETERS':
                        $errorMessage.text(emailOctopus.invalidParametersErrorMessage);
                        return;
                    case 'BOT_SUBMISSION':
                        $errorMessage.text(emailOctopus.botSubmissionErrorMessage);
                        return;
                }
            }
            $errorMessage.text(emailOctopus.unknownErrorMessage);
            $form.find(':submit').removeAttr('disabled');
        },
        ajaxSubmit: function($form) {
            $form.find(':submit').attr('disabled', true);
            $.ajax({
                type: $form.attr('method'),
                url: $form.attr('action'),
                data: $form.serialize(),
                success: function() {
                    if (emailOctopus.debug) {
                        console.log('EmailOctopus: posted');
                    }
                    emailOctopus.ajaxSuccess($form);
                },
                error: function(textStatus) {
                    if (emailOctopus.debug) {
                        console.log('EmailOctopus: error while posting');
                    }
                    emailOctopus.ajaxError($form, textStatus);
                },
            });
        }
    }
    if (emailOctopus.debug) {
        if (typeof window.jQuery == 'undefined') {
            console.log('EmailOctopus: error, no jQuery');
        }
        var $form = $('.email-octopus-form');
        if (!$form.length) {
            console.log('EmailOctopus: error, form missing');
        }
        if (!$form.siblings('.email-octopus-error-message').length) {
            console.log('EmailOctopus: error, form missing error message section');
        }
        if (!$form.find('.email-octopus-email-address').length) {
            console.log('EmailOctopus: error, form missing email address field');
        }
    }
    $('.email-octopus-form:not(.bound)').submit(function() {
        if (emailOctopus.debug) {
            console.log('EmailOctopus: form submitted');
        }
        var $form = $(this);
        var $errorMessage = $form.siblings('.email-octopus-error-message');
        var emailAddress = $form.find('.email-octopus-email-address').val();
        $errorMessage.empty();
        if (emailOctopus.isBotPost($form)) {
            if (emailOctopus.debug) {
                console.log('EmailOctopus: error, is bot post');
            }
            $errorMessage.text(emailOctopus.botSubmissionErrorMessage);
        } else if (!$.trim(emailAddress)) {
            if (emailOctopus.debug) {
                console.log('EmailOctopus: error, missing email address');
            }
            $errorMessage.text(emailOctopus.missingEmailAddressMessage);
        } else if (!emailOctopus.basicValidateEmail(emailAddress)) {
            if (emailOctopus.debug) {
                console.log('EmailOctopus: error, invalid email address');
            }
            $errorMessage.text(emailOctopus.invalidEmailAddressMessage);
        } else {
            if (emailOctopus.debug) {
                console.log('EmailOctopus: posting');
            }
            emailOctopus.ajaxSubmit($form);
        }
        return false;
    }).addClass('bound');
})(jQuery);
