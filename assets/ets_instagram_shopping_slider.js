/*== JUST USING Libraly customize my ETS == DO NOT CHANGE mamnually======*/
var eiss_break_request = 0;
var etsInsta = {
    getVideoUrl: function (photo) {
        if (photo.videos) {
            return photo.videos.standard_resolution.url;
        }
        return photo.images.standard_resolution.url;
    },

    setVideoUrl: function (videoUrl, mediaId, posterUrl) {
        var linkMedia = jQueryETS('#eiss_item_photo_' + mediaId + ' .eiss-fancybox-item').attr('href');
        if (linkMedia && linkMedia !== '_.mp4') {
            return;
        }
        var html = '<video class="fancybox-video" controls="" controlslist="nodownload" poster="' + posterUrl + '">';
        html += '<source src="' + videoUrl + '" type="video/mp4">';
        html += 'Sorry, your browser doesn\'t support embedded videos, ';
        html += '<a href="' + videoUrl + '">download</a> and watch with your favorite video player!';
        html += '</video>';
        jQueryETS('#eiss_item_photo_' + mediaId + ' .eiss-fancybox-item').attr('href', videoUrl);
        jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').html(html);
        var videoElement = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video');
        if (videoElement.length) {
            //videoElement.find('source').attr('src', videoUrl);
            try {
                videoElement[0].load();

                var playPromise = videoElement[0].play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        videoElement[0].play();
                    })
                        .catch(error => {

                        });
                }
                setTimeout(function () {
                    var height_set = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').length ? jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').height() : jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content img').height();
                    jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').css('height', height_set);
                }, 400);

            } catch (e) {

            }

        }

    },
    setCommentContent: function (comments) {
        var html = '';
        if (comments && comments.length) {
            for (var i = 0; i < comments.length; i++) {
                var commentText = comments[i].node.text;
                var commentUsername = comments[i].node.owner.username;
                html += '<div class="eiss-comment-item">';
                html += '<div class="eiss-comment-user">';
                html += '<a href="https://instagram.com/' + commentUsername + '" target="_blank" title="' + commentUsername + '">' + commentUsername + '</a>';
                html += '</div>';
                html += '<div class="eiss-comment-text">' + eissAddHashtag(commentText) + '</div>';
                html += '</div>';
            }
        }
        setTimeout(function () {
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-post-comments').html(html);
        }, 400);

    },
    getVideoInsta: function (linkPost, mediaId) {
        jQueryETS.ajax({
            url: linkPost,
            type: 'GET',
            success: function (content) {
                var dataJs = content.match(/<script\s*type\s*=\s*"text\/javascript"\s*>\s*window\._sharedData\s*=\s*(.*?)\s*;\s*<\/script>/i);

                if (dataJs !== null && dataJs.length) {
                    var result = JSON.parse(dataJs[1]);

                    if (result.entry_data && result.entry_data.PostPage && result.entry_data.PostPage[0]) {
                        try {

                            if (result.entry_data.PostPage[0].graphql.shortcode_media.video_url) {
                                var videoUrl = result.entry_data.PostPage[0].graphql.shortcode_media.video_url;
                                etsInsta.setVideoUrl(videoUrl, mediaId, result.entry_data.PostPage[0].graphql.shortcode_media.display_url);
                            }

                            if (result.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_parent_comment.count) {
                                var comments = result.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_parent_comment.edges;
                                etsInsta.setCommentContent(comments);
                            }
                            /*if (result.entry_data.PostPage[0].graphql.shortcode_media.owner) {
                                var urlImageProdfile = result.entry_data.PostPage[0].graphql.shortcode_media.owner.profile_pic_url;
                                var userName = result.entry_data.PostPage[0].graphql.shortcode_media.owner.username;
                                etsInsta.setProfileImage(urlImageProdfile, userName);
                            }*/
                        } catch (e) {
                        }
                    }

                }
            }
        });
    },
    setProfileImage: function (urlImage, username) {
        var linkInsta = 'https://instagram.com/' + username + '/';
        if (urlImage) {
            var html = '<div class="eiss-fancybox-userdata">';
            html += '<div class="eiss-userprofile">';
            html += '<img src="' + urlImage + '" class="eiss-user-avatar" onerror="eissProfileImageError(this)">';
            html += '</div>';
            html += '<div class="eiss-username">';
            html += '<span>';
            html += '<a href="' + linkInsta + '" target="_blank">' + username + '</a>';
            html += '</span>';
            html += '</div>';
            html += '<div class="eiss-user-follow">';
            html += '<a href="' + linkInsta + '" target="_blank" class="eiss-link-follow">Follow</a>';
            html += '</div>';
            html += '</div>';
            if (!jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-append-tagged-products .eiss-fancybox-userdata').length)
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-append-tagged-products').prepend(html);
        }

    },
    formatPhotoItem: function (node) {
        var photo = {};
        photo.id = node.id + '_' + node.owner.id;
        photo.user = {
            id: node.owner.id,
            username: node.owner.username,
            profile_picture: node.owner.profile_pic_url,
            profile_picture: node.owner.profile_pic_url,
        };
        photo.tags = [];
        photo.is_video = node.is_video;
        photo.type = node.is_video ? 'video' : 'image';
        photo.link = 'https://www.instagram.com/p/' + node.shortcode + '/';
        photo.images = {};

        //Thumbnail
        var resources = typeof node.thumbnail_resources !== 'undefined' ? node.thumbnail_resources : (typeof node.display_resources !== 'undefined' ? node.display_resources : []);
        for (var i = 0; i < resources.length; i++) {
            var image = {};
            image.width = resources[i].config_width;
            image.height = resources[i].config_height;
            image.url = resources[i].src;
            if (resources[i].config_width == 150) {
                photo.images.thumbnail = image;
            } else if (resources[i].config_width == 480) {
                photo.images.low_resolution = image;
            }

        }

        //Origin
        photo.images.standard_resolution = {};
        if (typeof node.dimensions !== 'undefined' && node.dimensions) {
            photo.images.standard_resolution.width = node.dimensions.width;
            photo.images.standard_resolution.height = node.dimensions.height;
            photo.images.standard_resolution.url = typeof node.display_url !== 'undefined' ? node.display_url : '';
        }
        photo.created_time = node.taken_at_timestamp;

        //video
        if (photo.is_video && typeof node.video_url !== 'undefined' && node.video_url) {
            photo.videos = {
                standard_resolution: {
                    url: node.video_url,
                    width: node.dimensions.width,
                    height: node.dimensions.height,
                }
            };
        }

        // Caption Text.
        photo.caption = {
            text: ''
        };
        if (typeof node.edge_media_to_caption !== 'undefined' && typeof node.edge_media_to_caption.edges !== 'undefined') {
            for (var i = 0; i < node.edge_media_to_caption.edges.length; i++) {
                if (typeof node.edge_media_to_caption.edges[i].caption !== 'undefined'
                    && typeof node.edge_media_to_caption.edges[i].caption.node !== 'undefined') {
                    photo.caption.text = eissAddHashtag(node.edge_media_to_caption.edges[i].caption.node.text) || '';
                }
            }
        }

        //like
        photo.likes = {
            count: typeof node.edge_media_preview_like !== 'undefined' ? node.edge_media_preview_like.count : 0
        };
        photo.comments = {
            count: 0
        };
        if (typeof node.edge_media_to_comment !== 'undefined' && typeof node.edge_media_to_comment.count !== 'undefined') {
            photo.comments.count = node.edge_media_to_comment.count;
        } else if (typeof node.edge_media_preview_comment !== 'undefined' && typeof node.edge_media_preview_comment.count !== 'undefined') {
            photo.comments.count = node.edge_media_preview_comment.count;
        }
        return photo;
    },
    formatPhotoItemGraphql: function (item) {

        var photo = {};
        photo.id = item.id;
        photo.user = {
            id: "",
            username: item.username,
            profile_picture: ""
        };
        photo.comments = {
            count: 0
        };
        photo.likes = {
            count: 0
        };
        photo.caption = null;
        if (typeof item.caption !== 'undefined') {
            photo.caption = {text: item.caption};
        }
        photo.images = {
            thumbnail: {
                width: 0,
                height: 0,
                url: typeof item.media_url !== 'undefined' ? item.media_url : ''
            },
            standard_resolution: {
                width: 0,
                height: 0,
                url: "",
            }
        };
        if((item.media_type == "VIDEO" || item.media_url.indexOf('.mp4?') !== -1) && typeof item.thumbnail_url !== 'undefined'){
            photo.images.standard_resolution.url = item.thumbnail_url;
        }
        else{
            photo.images.standard_resolution.url = item.media_url
        }
        photo.created_time = item.timestamp;
        photo.tags = [];
        photo.link = item.permalink;

        if (item.media_type == "VIDEO" || item.media_url.indexOf('.mp4?') !== -1) {
            photo.videos = {
                thumbnail: {
                    width: 0,
                    height: 0,
                    url: typeof item.media_url !== 'undefined' ? item.media_url : ''
                },
                standard_resolution: {
                    width: 0,
                    height: 0,
                    url: typeof item.media_url !== 'undefined' ? item.media_url : '',
                }
            };
        }
        return photo;
    },
    formatPhotoData: function (result) {
        if (result && typeof result.meta === 'undefined' && typeof result.status === 'undefined') {
            try {
                var datas = result.data;
                var photos = {
                    data: [],
                    pagination: {next_url: ''},
                    meta: {code: 200}
                };
                for (var i = 0; i < datas.length; i++) {
                    photos.data.push(etsInsta.formatPhotoItemGraphql(datas[i]));
                }
                if(typeof result.paging !== 'undefined' && typeof result.paging.next !== 'undefined'){
                    photos.pagination.next_url = result.paging.next;
                }

                return photos;
            } catch (e) {
                result = [];
            }
        } else if (result && typeof result.status !== 'undefined' && result.status == 'ok') {
            try {
                var nodes = result.data.user.edge_owner_to_timeline_media.edges;

                var endCursor = result.data.user.edge_owner_to_timeline_media.page_info.end_cursor || '';
                var userId = EISS_USERID;
                var queryHash = EISS_QUERY_HASH;
                var variables = {
                    first: 20,
                    id: userId,
                    after: endCursor
                };
                var nextUrl = 'https://instagram.com/graphql/query/?query_hash=' + queryHash + '&variables=' + encodeURI(JSON.stringify(variables));
                if (!result.data.user.edge_owner_to_timeline_media.page_info.has_next_page) {
                    nextUrl = null;
                }
                var photos = {
                    data: [],
                    pagination: {next_url: nextUrl},
                    meta: {code: 200}
                };
                if (nodes.length) {
                    for (var i = 0; i < nodes.length; i++) {
                        photos.data.push(etsInsta.formatPhotoItem(nodes[i].node));
                    }
                }
                return photos;
            } catch (e) {

                return [];
            }
        }
        return result
    },
    setSizePhotoItem: function (item) {
        var widthBox = jQueryETS('.ets-iss-section .eiss-item').first().find('.eiss-outer-img').width();
        var photoWidth = jQueryETS(item).width();
        var photoHeight = jQueryETS(item).height();
        var ratio = photoWidth > photoHeight ? (widthBox / photoHeight) : widthBox / photoWidth;
        if (photoWidth > photoHeight) {
            var margin = (photoWidth * ratio - widthBox) / -2;

            jQueryETS(item).parent('.eiss-box-outer-tag-photo').css({
                "margin-left": margin + "px",
                "width": "auto",
                "height": "100%",
                "margin-top": "0",
            });
            jQueryETS(item).css({
                "width": "auto",
                "height": "100%",
            });
        } else if (photoWidth < photoHeight) {
            var margin = (photoHeight * ratio - widthBox) / -2;

            jQueryETS(item).parent('.eiss-box-outer-tag-photo').css({
                "margin-top": margin + "px",
                "width": "100%",
                "height": "auto",
                "margin-left": "0",
            });
            jQueryETS(item).css({
                "width": "100%",
                "height": "auto",
            });
        } else {

            jQueryETS(item).parent('.eiss-box-outer-tag-photo').css({
                "margin-top": "0",
                "width": "100%",
                "height": "100%",
                "margin-left": "0",
            });
            jQueryETS(item).css({
                "width": "100%",
                "height": "100%",
            });
        }
        jQueryETS(item).css('opacity', 1);
        jQueryETS(item).closest('.instagram-photo').find('.insta-photo-params').css('opacity', 1);
        jQueryETS(item).closest('.eiss-item').removeClass('eiss-opacity-hide');
        var btnAddCart = jQueryETS(item).closest('.eiss-item').find('.eiss-btn-show-slide-photo');
        btnAddCart.removeClass('hide');
        btnAddCart.css('left', 'calc(50% - ' + (btnAddCart.outerWidth(true) / 2) + 'px)');
        btnAddCart.css('top', 'calc(50% - ' + (btnAddCart.outerHeight(true) / 2) + 'px)');

    },
    getNextUrl: function (result, init_number, nextUrl) {
        if (init_number >= result.data.length) {
            return nextUrl || null;
        }
        if (result.pagination.next_url.indexOf('query_hash') === -1 && result.pagination.next_url.indexOf('graph.instagram.com') === -1) {
            return nextUrl || null;
        }
        nextUrl = null;
        if (result.pagination.next_url.indexOf('query_hash') !== -1) {
            var variables = {
                first: init_number,
                id: EISS_USERID || '7683997498'
            };
            var linkRequest = 'https://instagram.com/graphql/query/?query_hash=' + EISS_QUERY_HASH + '&variables=' + encodeURI(JSON.stringify(variables));
            jQueryETS.ajax({
                url: linkRequest,
                type: 'GET',
                async: false,
                success: function (res) {

                    if (typeof res.data !== 'undefined') {
                        var vQ = {
                            id: EISS_USERID || '7683997498',
                            first: 20,
                            after: res.data.user.edge_owner_to_timeline_media.page_info.end_cursor
                        };
                        nextUrl = 'https://instagram.com/graphql/query/?query_hash=' + EISS_QUERY_HASH + '&variables=' + encodeURI(JSON.stringify(vQ));

                    }
                }
            });
        } else {
            var linkRequest = etsInsta.updateQueryStringParameter(result.pagination.next_url, 'after', '');
            linkRequest = etsInsta.updateQueryStringParameter(linkRequest, 'limit', init_number);
            jQueryETS.ajax({
                url: linkRequest,
                type: 'GET',
                async: false,
                success: function (res) {
                    if(res.paging)
                        nextUrl = res.paging.next;
                }
            });
        }
        return nextUrl;
    },
    updateQueryStringParameter: function (uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }

};
jQueryETS(function () {

    if (typeof ETS_ISS_ACCESS_TOKEN === 'undefined' || typeof ETS_ISS_INIT_CACHE_URL === 'undefined' || typeof ETS_ISS_TAG_CACHE_DATA === 'undefined' || typeof ETS_ISS_APP_URL === 'undefined' || typeof ETS_ISS_LAST_TIME_CLEAR === 'undefined') {
        return;
    }
    var appEISSInstalled = 0;
    jQueryETS('script').each(function () {
        if (jQueryETS(this).text().indexOf('asyncLoad') != -1 && jQueryETS(this).text().indexOf('ets_instagram_shopping_slider_init.js?') != -1) {
            appEISSInstalled = 1;
            return;
        }
    });
    if (!appEISSInstalled || !ETS_ISS_APP_ENABLED) {
        return;
    }
    jQueryETS('.ets-iss-section').show();
    eissGetPhotos(jQueryETS(window).width(), true, true);
    jQueryETS(window).resize(function () {
        eissGetPhotos(jQueryETS(window).width());
    });

    jQueryETS(document).on('shopify:section:select', function (event) {
        if (typeof event.detail !== 'undefined' && typeof event.detail.sectionId !== 'undefined' && event.detail.sectionId) {
            if (typeof event.detail.load !== 'undefined' && event.detail.load) {
                jQueryETS('.ets-iss-section').show();
                eissGetPhotos(jQueryETS(window).width(), true, true, event.detail.sectionId);
            }
        }
    });

    jQueryETS(document).on('shopify:section:load', function (event) {
        if (typeof event.detail !== 'undefined' && typeof event.detail.sectionId !== 'undefined' && event.detail.sectionId) {
            setTimeout(function () {
                if (!jQueryETS('#shopify-section-' + event.detail.sectionId + ' .ets-iss-photos').html()) {
                    jQueryETS('.ets-iss-section').show();
                    eissGetPhotos(jQueryETS(window).width(), true, true, event.detail.sectionId);
                }
            }, 400);
        }


    });

    jQueryETS(document).on('click', '.js-eiss-loadmore-photo', function (event) {
        event.preventDefault();
        var url_loadmore = jQueryETS(this).attr('data-url');
        var section_element = jQueryETS(this).closest('.ets-instagram-ss');
        eissGetSessionPhoto(section_element, url_loadmore, jQueryETS(window).width(), true);
    });

    jQueryETS(document).on('click', '.js-eiss-showmore-photo', function (event) {
        event.preventDefault();
        var num_show = jQueryETS(this).attr('data-number');
        jQueryETS(this).closest('.ets-instagram-ss').find('.eiss-item.eiss-hidden-photo').each(function (index, el) {
            if (index < num_show) {
                jQueryETS(this).removeClass('eiss-hidden-photo');
            } else {
                return;
            }
        });
        if (jQueryETS(this).closest('.ets-instagram-ss').find('.eiss-item.eiss-hidden-photo').length == 0) {
            jQueryETS(this).parent('.eiss-loadmore-box').remove();
        }
    });

    jQueryETS(document).on('mouseenter click', '.eiss-fancybox-slide.fancybox-slide--current .eiss-list-tagged-products__results .eiss-tagged-product-item', function (event) {
        if (jQueryETS(window).width() > 768) {
            jQueryETS(this).addClass('tag-hover');
            jQueryETS(this).closest('.eiss-fancybox-slide.fancybox-slide--current').find('.eiss_tag_point_' + jQueryETS(this).attr('data-tag-id')).addClass('tag-hover');
        }

    });
    jQueryETS(document).on('mouseleave', '.eiss-fancybox-slide.fancybox-slide--current .eiss-list-tagged-products__results .eiss-tagged-product-item', function (event) {
        event.preventDefault();
        jQueryETS(this).removeClass('tag-hover');
        jQueryETS(this).closest('.eiss-fancybox-slide.fancybox-slide--current').find('.eiss_tag_point_' + jQueryETS(this).attr('data-tag-id')).removeClass('tag-hover');
    });
    jQueryETS(document).on('mouseenter click', '.eiss-fancybox-slide.fancybox-slide--current .eiss-product-tag-item', function (event) {
        event.preventDefault();
        if (jQueryETS(window).width() > 768) {
            jQueryETS(this).addClass('tag-hover');
            jQueryETS(this).closest('.eiss-fancybox-slide.fancybox-slide--current').find('.eiss_tag_product_' + jQueryETS(this).attr('data-tag-id')).addClass('tag-hover');
        }
    });
    jQueryETS(document).on('mouseleave', '.eiss-fancybox-slide.fancybox-slide--current .eiss-product-tag-item', function (event) {
        event.preventDefault();
        jQueryETS(this).removeClass('tag-hover');
        jQueryETS(this).closest('.eiss-fancybox-slide.fancybox-slide--current').find('.eiss_tag_product_' + jQueryETS(this).attr('data-tag-id')).removeClass('tag-hover');
    });
    jQueryETS(document).on('click', '.eiss-product-tag-item', function (event) {
        var product_handle = jQueryETS(this).attr('data-product-handle');
        window.location.href = "/products/" + product_handle;
    });

    jQueryETS(document).on('mouseover', '.eiss-item .eiss-product-tag-item.tagged', function (event) {
        event.preventDefault();
        jQueryETS(this).closest('.eiss-fancybox-item').addClass('hover-point-tagged');
    });
    jQueryETS(document).on('mouseleave', '.eiss-item .eiss-product-tag-item.tagged', function (event) {
        event.preventDefault();
        jQueryETS(this).closest('.eiss-fancybox-item').removeClass('hover-point-tagged');
    });

    jQueryETS(document).on('click', '.eiss-btn-tagged-product-add-card', function (event) {
        event.preventDefault();
        var variant_id = jQueryETS(this).attr('data-variant');
        var jQueryETSthis = jQueryETS(this);
        jQueryETS.ajax({
            url: '/cart/add.js',
            type: 'POST',
            dataType: 'json',
            data: {
                quantity: 1,
                id: variant_id
            },
            beforeSend: function () {
                jQueryETSthis.prop('disabled', true);
            },
            success: function (res) {
                if (typeof res.id !== 'undefined') {
                    if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').attr('data-viewcart') == 'alert') {
                        eissToastSuccess('Added to cart, <a href="/cart">see detail</a>');
                    } else {
                        window.location.href = '/cart';
                        eissToastSuccess('Added to cart!');
                    }

                } else {
                    eissToastSuccess('Product added fail');
                }
            },
            error: function (xhr) {
                if (typeof xhr.readyState !== 'undefined' && xhr.readyState == 4 && xhr.responseJSON) {
                    if (typeof xhr.responseJSON.description !== 'undefined' && xhr.responseJSON.description) {
                        eissToastSuccess(xhr.responseJSON.description);
                    }
                }

            },
            complete: function (res) {
                jQueryETSthis.prop('disabled', false);
            }
        })

    });
    jQueryETS(document).on('click', '.js-eiss-close-toast', function (event) {
        event.preventDefault();
        jQueryETS(this).closest('.eiss-toast').remove();
    });
    jQueryETS(document).on('click', '.eiss-btn-show-slide-photo', function (event) {
        jQueryETS(this).prev('a.eiss-fancybox-item').trigger('click');
    });

});

function eissGetSessionPhoto(section_element, url_request, width_browser, request_data, first_load, sectionEditing) {
    var first_load = typeof first_load !== 'undefined' ? first_load : false;
    var sectionEditing = typeof sectionEditing !== 'undefined' ? sectionEditing : false;

    var eiss_init_displayed = parseInt(jQueryETS(section_element).attr('data-init-displayed'));
    var eiss_max_displayed = jQueryETS(section_element).attr('data-max-displayed') ? parseInt(jQueryETS(section_element).attr('data-max-displayed')) : '';
    var eiss_carousel_displayed = jQueryETS(section_element).attr('data-carousel-displayed') ? parseInt(jQueryETS(section_element).attr('data-carousel-displayed')) : '';
    var eiss_per_row_desktop = parseInt(jQueryETS(section_element).attr('data-per-row-desktop'));
    var eiss_per_row_tablet = parseInt(jQueryETS(section_element).attr('data-per-row-tablet'));
    var eiss_per_row_mobile = parseInt(jQueryETS(section_element).attr('data-per-row-mobile'));
    var eiss_photo_spacing = parseInt(jQueryETS(section_element).attr('data-photo-spacing'));
    var eiss_layout_type = jQueryETS(section_element).attr('data-layout-type');
    var eiss_carousel_autoplay = parseInt(jQueryETS(section_element).attr('data-carousel-autoplay'));
    var eiss_carousel_delay = parseInt(jQueryETS(section_element).attr('data-carousel-delay'));
    var eiss_carousel_loop = parseInt(jQueryETS(section_element).attr('data-carousel-loop'));
    var eiss_photo_gallery = jQueryETS(section_element).attr('data-photo-gallery');
    var eiss_photo_filter_init = jQueryETS(section_element).attr('data-photo-filter-init');
    var eiss_photo_filter_hover = jQueryETS(section_element).attr('data-photo-filter-hover');
    var eiss_force_slide_on_mobile = jQueryETS(section_element).attr('data-slide-mobile') == 'true' ? 1 : 0;
    var eiss_shopnow_enable = jQueryETS(section_element).attr('data-shopnow-enable');
    var eiss_shopnow_title = jQueryETS(section_element).attr('data-shopnow-title');
    var eiss_shopnow_bg_color = jQueryETS(section_element).attr('data-shopnow-bg-color');
    var eiss_shopnow_bg_color_hover = jQueryETS(section_element).attr('data-shopnow-bg-color-hover');
    var eiss_shopnow_border_color = jQueryETS(section_element).attr('data-shopnow-border-color');
    var eiss_shopnow_border_color_hover = jQueryETS(section_element).attr('data-shopnow-border-color-hover');
    var eiss_shopnow_text_color = jQueryETS(section_element).attr('data-shopnow-text-color');
    var eiss_shopnow_text_color_hover = jQueryETS(section_element).attr('data-shopnow-text-color-hover');
    var eiss_shopnow_title_photo = jQueryETS(section_element).attr('data-shopnow-title-photo');
    var eiss_shopnow_title_video = jQueryETS(section_element).attr('data-shopnow-title-video');
    var eiss_show_btn_loadmore = parseInt(jQueryETS(section_element).attr('data-show-btn-loadmore'));
    var eiss_show_comment = parseInt(jQueryETS(section_element).attr('data-show-comment'));
    var eiss_view_cart = jQueryETS(section_element).attr('data-view-cart');
    var eiss_auto_loadmore = jQueryETS(section_element).attr('data-auto-loadmore');
    var eiss_product_id = jQueryETS(section_element).attr('data-product-id') || 0;

    var class_img = '';
    switch (eiss_photo_filter_init) {
        case 'greyout':
            class_img += ' eiss-filter-greyout';
            break;
        case 'sepia':
            class_img += ' eiss-filter-sepia';
            break;
        case 'saturate':
            class_img += ' eiss-filter-saturate';
            break;
        case 'contrast':
            class_img += ' eiss-filter-contrast';
            break;
        case 'hue_rotate':
            class_img += ' eiss-filter-hue-rotate';
            break;
        case 'opacity':
            class_img += ' eiss-filter-opacity';
            break;
        case 'invert':
            class_img += ' eiss-filter-invert';
            break;
        case 'blur':
            class_img += ' eiss-filter-blur';
            break;
        case 'brightness':
            class_img += ' eiss-filter-brightness';
            break;
    }
    switch (eiss_photo_filter_hover) {
        case 'greyout':
            class_img += ' eiss-filter-greyout-hover';
            break;
        case 'sepia':
            class_img += ' eiss-filter-sepia-hover';
            break;
        case 'saturate':
            class_img += ' eiss-filter-saturate-hover';
            break;
        case 'contrast':
            class_img += ' eiss-filter-contrast-hover';
            break;
        case 'hue_rotate':
            class_img += ' eiss-filter-hue-rotate-hover';
            break;
        case 'opacity':
            class_img += ' eiss-filter-opacity-hover';
            break;
        case 'invert':
            class_img += ' eiss-filter-invert-hover';
            break;
        case 'blur':
            class_img += ' eiss-filter-blur-hover';
            break;
        case 'brightness':
            class_img += ' eiss-filter-brightness-hover';
            break;
        default:
            class_img += ' eiss-filter-default-hover';
            break;
    }

    var classShopNow = "eiss_shopnow_" + eissGetRandomInt(11111, 999999);
    var styleShopNow = '<style type="text/css">';
    styleShopNow += '.eiss-btn-show-slide-photo.' + classShopNow + '{'
        + 'background:' + (eiss_shopnow_bg_color ? eiss_shopnow_bg_color : '#ffffff') + ';'
        + 'border-color:' + (eiss_shopnow_border_color ? eiss_shopnow_border_color : '#ffffff') + ';'
        + 'color:' + (eiss_shopnow_text_color ? eiss_shopnow_text_color : '#333333') + ';'
        + '}';
    styleShopNow += '.eiss-btn-show-slide-photo.' + classShopNow + ':hover,.eiss-btn-show-slide-photo.' + classShopNow + ':focus{'
        + 'background:' + (eiss_shopnow_bg_color_hover ? eiss_shopnow_bg_color_hover : '#ffffff') + ';'
        + 'border-color:' + (eiss_shopnow_border_color_hover ? eiss_shopnow_border_color_hover : '#ffffff') + ';'
        + 'color:' + (eiss_shopnow_text_color_hover ? eiss_shopnow_text_color_hover : '#333333') + ';'
        + '}';
    styleShopNow += '</style>';
    jQueryETS(section_element).prepend(styleShopNow);
    var eiss_section = jQueryETS(section_element);
    var eiss_grid = eiss_per_row_desktop;
    if (width_browser < 992 && width_browser >= 768) {
        eiss_grid = eiss_per_row_tablet;
    } else if (width_browser < 768) {
        eiss_grid = eiss_per_row_mobile;
    }
    var section_width = eiss_section.innerWidth();
    var photo_width = 50;
    var grid_col = 12 / eiss_grid;
    switch (grid_col) {
        case 1:
            photo_width = section_width * 8.33333333 / 100;
            break;
        case 2:
            photo_width = section_width * 16.66666667 / 100;
            break;
        case 3:
            photo_width = section_width * 25 / 100;
            break;
        case 4:
            photo_width = section_width * 33.33333333 / 100;
            break;
        case 6:
            photo_width = section_width * 33.33333333 / 100;
            break;
        case 12:
            photo_width = section_width;
            break;
    }
    var photo_height = parseInt(photo_width);
    if (section_width < 1200) {
        jQueryETS(section_element).find('.ets-iss-section-heading').addClass('eiss-header-sm');
    }

    if (photo_height < 200 && photo_height > 120) {
        jQueryETS(section_element).addClass('eiss-img-sm');
    } else if (photo_height <= 120) {
        jQueryETS(section_element).removeClass('eiss-img-sm');
        jQueryETS(section_element).addClass('eiss-img-xs');
    } else {
        jQueryETS(section_element).removeClass('eiss-img-sm');
        jQueryETS(section_element).removeClass('eiss-img-xs');
    }
    if (eiss_section.find('.eiss-slick-slide').length) {
        if (photo_height < 200) {
            eiss_section.find('.eiss-slick-slide').addClass('eiss-slick-small');
        } else {
            eiss_section.find('.eiss-slick-slide').removeClass('eiss-slick-small');
        }
    }
    if (eiss_layout_type !== 'carousel' && eiss_max_displayed != '' && eiss_init_displayed > eiss_max_displayed) {
        eiss_init_displayed = eiss_max_displayed;
    }
    var count_photo = eiss_init_displayed ? eiss_init_displayed : 18;
    var item_length = eiss_section.find('.eiss-item').length;

    if (eiss_layout_type !== 'carousel') {
        if (eiss_max_displayed != '') {
            if (item_length > 0 && item_length < eiss_max_displayed) {
                count_photo = eiss_max_displayed - item_length;
            }
        }


        if (eiss_init_displayed && count_photo > eiss_init_displayed) {
            count_photo = eiss_init_displayed;
        }
    } else {
        count_photo = eiss_carousel_displayed ? eiss_carousel_displayed : 18;
    }

    if (count_photo > 20) {
        count_photo = 20;
    }
    if (request_data) {
        if (typeof ETS_ISS_TAG_CACHE_DATA.data == 'object' && typeof ETS_ISS_TAG_CACHE_DATA.data.length == 'undefined') {
            var arrData = Object.keys(ETS_ISS_TAG_CACHE_DATA.data).map(function (key) {
                return ETS_ISS_TAG_CACHE_DATA.data[key];
            });
            ETS_ISS_TAG_CACHE_DATA.data = arrData;
        }
        if (url_request.indexOf('query_hash') === -1)
            url_request = eissUpdateQueryStringParameter(url_request, 'count', count_photo);
        if (eiss_photo_gallery == 'all') {
            jQueryETS.ajax({
                url: eissUpdateQueryStringParameter(url_request, 'count', count_photo),
                type: 'GET',
                dataType: url_request.indexOf('api.instagram.com') !== -1 ? 'jsonp' : 'json',
                beforeSend: function () {
                    if (eiss_section.find('.eiss-loadmore-box').length > 0) {
                        eiss_section.find('.eiss-loadmore-box').remove();
                    }
                    eiss_section.find('.ets-iss-photos').append('<div class="eiss-loading"><div class="eiss-loader"></div> <span class="eiss-text-loading">Loading...</span></div>');
                },
                success: function (res) {

                    if (!first_load) {
                        res = etsInsta.formatPhotoData(res);
                    }
                    if (typeof res.data !== 'undefined' && res.data.length > 0) {
                        if (first_load) {
                            eiss_section.find('.ets-iss-photos').html('');
                        }

                        var photos = res.data;
                        var content_html = '';
                        var photos_length = photos.length;
                        var next_url = typeof res.pagination.next_url !== 'undefined' ? res.pagination.next_url : '';
                        if (first_load) {
                            next_url = etsInsta.getNextUrl(res, eiss_init_displayed, next_url);
                        }
                        if (first_load && !next_url && photos.length > count_photo) {
                            next_url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + ETS_ISS_ACCESS_TOKEN;
                        }
                        if (photos.length > count_photo && next_url) {
                            if (next_url.indexOf('query_hash') === -1) {
                                next_url = eissUpdateQueryStringParameter(next_url, 'max_id', photos[count_photo - 1].id);
                                next_url = eissUpdateQueryStringParameter(next_url, 'count_photo', count_photo);
                            }
                            photos_length = count_photo;
                        }

                        for (var i = 0; i < photos_length; i++) {
                            var photo = photos[i];

                            if (photo.images && photo.images.standard_resolution) {
                                var padding_right = eiss_photo_spacing ? eiss_photo_spacing : 0;
                                /*if(!eiss_section.find('.eiss-slick-slide').length){
                                    var mod_last_item = (i+1) % eiss_grid;
                                    if(mod_last_item == 0){
                                        console.log('__'+i);
                                        padding_right = 0;
                                    }
                                }*/
                                var id_video_el = eissGetRandomInt(1111111, 99999999999);
                                content_html += '<div class="eiss-item eiss-col-' + (12 / eiss_grid) + ' eiss_item_photo_' + photo.id + ' eiss-opacity-hide" style="padding-right: ' + padding_right + 'px; padding-bottom:' + (eiss_photo_spacing ? eiss_photo_spacing : 0) + 'px; height: ' + photo_width + 'px; visibility: visible;">';
                                content_html += '<div class="eiss-outer-img">';
                                content_html += '<a data-options=\'{"touch" : false}\'  href="' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? etsInsta.getVideoUrl(photo) : photo.images.standard_resolution.url) + '" ' + (eiss_shopnow_enable == 1 ? '' : 'title="Click to view ' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'video' : 'photo') + ' in full"') + ' data-ets-fancybox="images" class="eiss-fancybox-item" data-idvideo="' + 'iess_video_' + id_video_el + '" data-url="' + photo.images.standard_resolution.url + '" data-likes="' + photo.likes.count + '" data-comments="' + photo.comments.count + '" data-link="' + photo.link + '" data-cat="' + photo.type + '" data-idmedia="' + photo.id + '" data-tus="' + (photo.caption ? eissAddslashes(photo.caption.text) : '') + '" data-tags="' + (photo.tags.length ? photo.tags.join(',') : '') + '" data-userprofile="' + (typeof photo.user.profile_picture !== 'undefined' ? photo.user.profile_picture : '') + '" data-username="' + photo.user.username + '" data-show_comment="' + eiss_show_comment + '" data-view_cart="' + eiss_view_cart + '" data-created_time="' + photo.created_time + '">';
                                content_html += '<div class="eiss-box-outer-tag-photo">';
                                content_html += '<img src="' + photo.images.standard_resolution.url + '" class="ets-iss-img ' + (class_img) + '" onload="etsInsta.setSizePhotoItem(this)"/>';
                                if (photo.type == 'video' || typeof photo.videos !== 'undefined') {
                                    content_html += '<span class="eiss-play-icon"></span>';
                                }
                                var eiss_tag_item = null;
                                if (typeof ETS_ISS_TAG_CACHE_DATA.data !== 'undefined' && ETS_ISS_TAG_CACHE_DATA.data.length) {
                                    jQueryETS.each(ETS_ISS_TAG_CACHE_DATA.data, function (_ie, tag_item) {
                                        if (tag_item.id == photo.id) {
                                            eiss_tag_item = tag_item;
                                            return;
                                        }
                                    });

                                    if (eiss_tag_item && typeof eiss_tag_item.product_tags !== 'undefined' && eiss_tag_item.product_tags && eiss_tag_item.product_tags.length) {
                                        jQueryETS.each(eiss_tag_item.product_tags, function (_ie, tag_item) {
                                            content_html += '<div class="eiss-product-tag-item tagged eiss_tag_point_thumb_' + tag_item.id + '" title="' + tag_item.product_title + (tag_item.variant_title && tag_item.variant_title !== 'null' ? ' | ' + tag_item.variant_title : '') + '" data-idmedia="' + photo.id + '" style="top: ' + tag_item.position_top + 'px; left: ' + tag_item.position_left + 'px;' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'display:none;' : '') + '" data-position-top="' + tag_item.position_top + '" data-position-left="' + tag_item.position_left + '" data-tag-key="' + (_ie + 1) + '" data-tag-id="' + tag_item.id + '" data-photo-width="' + tag_item.photo_width + '" data-photo-height="' + tag_item.photo_height + '" data-product-title="' + tag_item.product_title + '" data-product-handle="' + tag_item.product_handle + '" data-variant-title="' + tag_item.variant_title + '" data-product-image="' + tag_item.product_image + '" data-variant-id="' + tag_item.variant_id + '" data-currency="' + (typeof ETS_ISS_TAG_CACHE_DATA.money_format !== 'undefined' ? ETS_ISS_TAG_CACHE_DATA.currency : '') + '" data-money-format="' + (typeof ETS_ISS_TAG_CACHE_DATA.money_format !== 'undefined' ? ETS_ISS_TAG_CACHE_DATA.money_format : '') + '" data-product-price="' + tag_item.product_price + '">' + (_ie + 1) + '</div>'
                                        });
                                    }
                                }

                                content_html += '</div>';
                                content_html += '</a>';
                                if (eiss_shopnow_enable == 1 && jQueryETS(window).width() > 768) {
                                    if (eiss_tag_item && typeof eiss_tag_item.product_tags !== 'undefined' && eiss_tag_item.product_tags.length) {
                                        content_html += '<button class="eiss-btn-show-slide-photo hide shopping-cart ' + classShopNow + '">' + (eiss_shopnow_title ? (eiss_shopnow_title.length > 15 ? eiss_shopnow_title.substr(0, 15) + '...' : eiss_shopnow_title) : 'Shop now') + '</button>';
                                    } else {
                                        content_html += '<button class="eiss-btn-show-slide-photo hide show-slide ' + classShopNow + '">' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? (eiss_shopnow_title_video ? (eiss_shopnow_title_video.length > 15 ? eiss_shopnow_title_video.substr(0, 15) + '...' : eiss_shopnow_title_video) : 'Vide video') : (eiss_shopnow_title_photo ? (eiss_shopnow_title_photo.length > 15 ? eiss_shopnow_title_photo.substr(0, 15) + '...' : eiss_shopnow_title_photo) : 'View photo')) + '</button>';
                                    }
                                }

                                content_html += '<div class="eiss-photo-params">';
                                if (photo.likes.count > 0) {
                                    content_html += '<span class="eiss-likes" title="Likes">' + photo.likes.count + '</span>';
                                }
                                if (photo.comments.count > 0 && eiss_show_comment) {
                                    content_html += '<span class="eiss-comments" title="Comments">' + photo.comments.count + '</span>';
                                }
                                content_html += '<a href="' + photo.link + '" class="eiss-view-photo-detail" target="_blank" title="' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'Click here to open video on Instagram' : 'Click here to open image on Instagram') + '"></a>';
                                content_html += '</div>';

                                content_html += '</div>';
                                content_html += '</div>';
                            }
                        }
                        eiss_section.find('.eiss-loading').remove();

                        if (res.pagination && next_url && (eiss_max_displayed == '' || (eiss_max_displayed != '' && (count_photo + item_length) < eiss_max_displayed)) && eiss_layout_type !== 'carousel' && eiss_show_btn_loadmore && (!eiss_force_slide_on_mobile || (eiss_force_slide_on_mobile && jQueryETS(window).width() > 768))) {
                            content_html += '<div class="eiss-loadmore-box"><button class="eiss-btn-loadmore js-eiss-loadmore-photo" data-url="' + next_url + '">Load more</button></div>';
                        }

                        eiss_section.find('.ets-iss-photos').append(content_html);
                        //eissSetPosImg(eiss_section);
                        if (!first_load) {
                            setTimeout(function () {
                                //eissSetHeightPhoto(eiss_section, null);
                            }, 500);
                        }


                        eissInitSlickSlide(eiss_section,
                            eiss_carousel_autoplay,
                            eiss_carousel_loop, eiss_carousel_delay,
                            eiss_per_row_desktop,
                            eiss_per_row_tablet,
                            eiss_per_row_mobile,
                            padding_right,
                            eiss_photo_spacing,
                            eiss_force_slide_on_mobile);
                        eissCalculatePositionTag(eiss_section);


                        if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').length) {
                            eissCalculatePositionTag(eiss_section, true);
                        }

                        eissInitFancybox(section_element);
                        eissCheckPhotoError(eiss_section);
                        jQueryETS(window).resize(function (event) {
                            var height_set = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').length ? jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').height() : jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content img').height()
                            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').css('height', height_set);
                            if (!jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').length) {
                                if (jQueryETS(window).width() <= 767) {
                                    jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').animate({left: 0});
                                } else {
                                    jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').animate({left: '25%'});
                                }
                            }
                            var box_height = jQueryETS('.eiss-fancybox').height();
                            var photo_height = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').height();
                            var padding_top_slide = (box_height - photo_height) / 2;
                            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current').css('padding-top', padding_top_slide + 'px');
                            setTimeout(function () {
                                //eissSetHeightPhoto(eiss_section, null);
                            }, 500);
                        });

                    } else {
                        if (first_load)
                            eiss_section.find('.ets-iss-photos').append('<p class="ets-iss-aler-no-photo">No Instagram photos available. Instagram access token is not correct, please update Instagram access token</p>');
                        else
                            eiss_section.find('.ets-iss-photos').append('<p class="ets-iss-aler-no-photo">No more photo</p>');
                    }
                },
                complete: function () {
                    eiss_section.find('.eiss-loading').remove();
                }
            });
        } else if (eiss_photo_gallery == 'featured' || eiss_photo_gallery == 'tagged' || eiss_photo_gallery == 'tagged_current_product') {
            if (typeof ETS_ISS_TAG_CACHE_DATA.data !== 'undefined' && ETS_ISS_TAG_CACHE_DATA.data.length) {
                eiss_section.find('.ets-iss-photos').append('<div class="eiss-loading"><div class="eiss-loader"></div> <span class="eiss-text-loading">Loading...</span></div>');
                var photos = [];
                var count_featured_photo = eiss_max_displayed;
                if (eiss_layout_type == 'carousel') {
                    count_featured_photo = eiss_init_displayed;
                }
                if (eiss_photo_gallery == 'featured') {
                    photos = eissSortArrayAsc(ETS_ISS_TAG_CACHE_DATA.data, 'sort_featured');
                    photos = eissGetFeaturedPhotos(photos, count_featured_photo);
                } else if (eiss_photo_gallery == 'tagged') {
                    photos = eissSortArrayAsc(ETS_ISS_TAG_CACHE_DATA.data, 'sort_tagged');
                    photos = eissGetTaggedPhotos(photos, count_featured_photo);
                } else {
                    photos = eissGetTaggedPhotos(ETS_ISS_TAG_CACHE_DATA.data, count_featured_photo, eiss_product_id);
                    photos = eissSortArrayAsc(photos, 'sort_tagged');
                    console.log('.........');
                    console.log(photos);
                    if(!photos || ! photos.length){
                        jQueryETS(section_element).closest('.ets-iss-section').addClass('ets-iss-hide');
                    }
                    else{
                        jQueryETS(section_element).closest('.ets-iss-section').removeClass('ets-iss-hide');
                    }
                }
                var photos_length = photos.length;
                if (eiss_layout_type == 'carousel' && eiss_init_displayed < photos_length) {
                    photos_length = eiss_init_displayed;
                }
                var content_html = '';
                for (var i = 0; i < photos_length; i++) {
                    var photo = photos[i];

                    if (photo.thumb_src) {
                        var padding_right = eiss_photo_spacing ? eiss_photo_spacing : 0;
                        if (!eiss_section.find('.eiss-slick-slide').length) {
                            var mod_last_item = (i + 1) % eiss_grid;
                            if (mod_last_item == 0) {
                                padding_right = 0;
                            }
                        }
                        var id_video_el = eissGetRandomInt(1111111, 99999999999);
                        content_html += '<div class="eiss-item eiss-col-' + (12 / eiss_grid) + ' eiss_item_photo_' + photo.id + ' eiss-opacity-hide ' + (i >= eiss_init_displayed ? 'eiss-hidden-photo' : '') + '" style="padding-right: ' + padding_right + 'px; padding-bottom:' + (eiss_photo_spacing ? eiss_photo_spacing : 0) + 'px; height:' + photo_width + 'px;">';
                        content_html += '<div class="eiss-outer-img">';
                        content_html += '<a href="' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? photo.media_src : photo.thumb_src) + '" title="Click to view ' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'video' : 'photo') + ' in full" data-ets-fancybox="images" class="eiss-fancybox-item" data-idvideo="' + 'iess_video_' + id_video_el + '" data-url="' + photo.thumb_src + '" data-likes="' + photo.likes + '" data-comments="' + photo.comments + '" data-link="' + photo.link + '" data-cat="' + photo.type + '" data-idmedia="' + photo.id + '" data-tus="' + (photo.caption ? eissAddslashes(photo.caption) : '') + '" data-tags="' + (typeof photo.tags !== 'undefined' && photo.tags.length > 0 ? photo.tags.join(',') : '') + '" data-userprofile="' + (typeof photo.userprofile !== ' undefined' ? photo.userprofile : '') + '" data-username="' + (typeof photo.username !== 'undefined' ? photo.username : '') + '" data-show_comment="' + eiss_show_comment + '" data-view_cart="' + eiss_view_cart + '" data-created_time="' + (typeof photo.created_time !== 'undefined' ? photo.created_time : '') + '">';
                        content_html += '<div class="eiss-box-outer-tag-photo">';
                        content_html += '<img src="' + photo.thumb_src + '" class="ets-iss-img ' + (class_img) + '" onload="etsInsta.setSizePhotoItem(this)"/>';
                        if (photo.type == 'video' || typeof photo.videos !== 'undefined') {
                            content_html += '<span class="eiss-play-icon"></span>';
                        }
                        if (typeof photo.product_tags !== 'undefined') {
                            jQueryETS.each(photo.product_tags, function (_ie, tag_item) {
                                content_html += '<div class="eiss-product-tag-item tagged eiss_tag_point_thumb_' + tag_item.id + '" title="' + tag_item.product_title + (tag_item.variant_title && tag_item.variant_title !== 'null' ? ' | ' + tag_item.variant_title : '') + '" data-idmedia="' + photo.id + '" style="top: ' + tag_item.position_top + 'px; left: ' + tag_item.position_left + 'px;' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'display:none;' : '') + '" data-position-top="' + tag_item.position_top + '" data-position-left="' + tag_item.position_left + '" data-tag-key="' + (_ie + 1) + '" data-tag-id="' + tag_item.id + '" data-photo-width="' + tag_item.photo_width + '" data-photo-height="' + tag_item.photo_height + '" data-product-title="' + tag_item.product_title + '" data-product-handle="' + tag_item.product_handle + '" data-variant-title="' + tag_item.variant_title + '" data-product-image="' + tag_item.product_image + '" data-variant-id="' + tag_item.variant_id + '" data-currency="' + (typeof ETS_ISS_TAG_CACHE_DATA.money_format !== 'undefined' ? ETS_ISS_TAG_CACHE_DATA.currency : '') + '" data-money-format="' + (typeof ETS_ISS_TAG_CACHE_DATA.money_format !== 'undefined' ? ETS_ISS_TAG_CACHE_DATA.money_format : '') + '" data-product-price="' + tag_item.product_price + '">' + (_ie + 1) + '</div>'
                            });
                        }

                        content_html += '</div>';
                        content_html += '</a>';
                        if (eiss_shopnow_enable == 1 && jQueryETS(window).width() > 768) {
                            if (typeof photo.product_tags !== 'undefined' && photo.product_tags.length) {
                                content_html += '<button class="eiss-btn-show-slide-photo hide shopping-cart ' + classShopNow + '">' + (eiss_shopnow_title ? (eiss_shopnow_title.length > 15 ? eiss_shopnow_title.substr(0, 15) + '...' : eiss_shopnow_title) : 'Shop now') + '</button>';
                            } else {
                                content_html += '<button class="eiss-btn-show-slide-photo hide show-slide ' + classShopNow + '">' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? (eiss_shopnow_title_video ? (eiss_shopnow_title_video.length > 15 ? eiss_shopnow_title_video.substr(0, 15) + '...' : eiss_shopnow_title_video) : 'View video') : (eiss_shopnow_title_photo ? (eiss_shopnow_title_photo.length > 15 ? eiss_shopnow_title_photo.substr(0, 15) + '...' : eiss_shopnow_title_photo) : 'View photo')) + '</button>';
                            }
                        }
                        content_html += '<div class="eiss-photo-params">';
                        if (photo.likes > 0) {
                            content_html += '<span class="eiss-likes" title="Likes">' + photo.likes + '</span>';
                        }
                        if (photo.comments > 0 && eiss_show_comment) {
                            content_html += '<span class="eiss-comments" title="Comments">' + photo.comments + '</span>';
                        }
                        content_html += '<a href="' + photo.link + '" class="eiss-view-photo-detail" target="_blank" title="' + (photo.type == 'video' || typeof photo.videos !== 'undefined' ? 'Click here to open video on Instagram' : 'Click here to open image on Instagram') + '"></a>';
                        content_html += '</div>';

                        content_html += '</div>';
                        content_html += '</div>';
                    }
                }
                if (eiss_init_displayed < photos_length && eiss_show_btn_loadmore && (!eiss_force_slide_on_mobile || (eiss_force_slide_on_mobile && jQueryETS(window).width() > 768))) {
                    content_html += '<div class="eiss-loadmore-box"><button class="eiss-btn-loadmore js-eiss-showmore-photo" data-number="' + eiss_init_displayed + '">Load more</button></div>';
                }

                eiss_section.find('.eiss-loading').remove();
                eiss_section.find('.ets-iss-photos').append(content_html);
                //eissSetPosImg(eiss_section);
                if (!first_load) {
                    setTimeout(function () {
                        //eissSetHeightPhoto(eiss_section, null);
                    }, 500);
                }

                /* SLICK init*/
                eissInitSlickSlide(eiss_section,
                    eiss_carousel_autoplay,
                    eiss_carousel_loop,
                    eiss_carousel_delay,
                    eiss_per_row_desktop,
                    eiss_per_row_tablet,
                    eiss_per_row_mobile,
                    padding_right,
                    eiss_photo_spacing,
                    eiss_force_slide_on_mobile);
                eissCalculatePositionTag(eiss_section);
                if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').length) {
                    eissCalculatePositionTag(eiss_section, true);
                }
                eissInitFancybox(section_element);
                eissCheckPhotoError(eiss_section);
            } else {
                if (first_load)
                    eiss_section.find('.ets-iss-photos').append('<p class="ets-iss-aler-no-photo">No Instagram photos available</p>');
            }

        }
        //jQueryETS(window).resize();
        var idSection = jQueryETS(section_element).parent().attr('id');
        if (typeof idSection !== 'undefined' && eiss_layout_type != 'carousel'
            && eiss_show_btn_loadmore == 1 && eiss_auto_loadmore == 1) {

            jQueryETS(document).scroll(function (event) {
                setTimeout(function () {
                    eissScrollAutoLoad(idSection);
                }, 500);
            });
        }
    } else {

        var count_photo = 0;
        jQueryETS(section_element).find('.eiss-item').each(function (i, ele) {
            // jQueryETS(ele).attr('class', 'eiss-item');
            jQueryETS(ele).removeClass(function (index, className) {
                return (className.match(/\eiss-col\S+/g) || []).join(' ');
            });
            jQueryETS(ele).addClass('eiss-col-' + (12 / eiss_grid));
            var padding_right = eiss_photo_spacing ? eiss_photo_spacing : 0;
            if (eiss_section.find('.eiss-slick-slide').length) {
                var mod_last_item = (count_photo + 1) % eiss_grid;
                if (mod_last_item == 0) {
                    padding_right = 0;
                }
            }

            photo_height = photo_height - padding_right;
            jQueryETS(ele).css('padding-right', padding_right + 'px');
            count_photo++;
        });

        // jQueryETS(section_element).find('.ets-iss-img').css('height', photo_height);
        setTimeout(function () {
            eissSetHeightPhoto(section_element, null);
            eissCalculatePositionTag(section_element);
        }, 200);

        if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').length) {
            eissCalculatePositionTag(eiss_section, true);
        }
    }


}

function eissInitSlickSlide(eiss_section,
                            eiss_carousel_autoplay,
                            eiss_carousel_loop,
                            eiss_carousel_delay,
                            eiss_per_row_desktop,
                            eiss_per_row_tablet,
                            eiss_per_row_mobile,
                            padding_right,
                            photo_spacing,
                            force_slide_on_mobile) {
    var force_slide_on_mobile = typeof force_slide_on_mobile !== 'undefined' ? force_slide_on_mobile : 0;

    if (eiss_section.find('.eiss-slick-slide').length || (force_slide_on_mobile && jQueryETS(window).width() <= 768)) {
        if (!eiss_section.find('.eiss-slick-slide').hasClass('eiss-slick-slide')) {
            eiss_section.find('.ets-iss-photos').addClass('eiss-slick-slide');
        }
        eiss_section.find('.eiss-slick-slide').slick({
            dots: false,
            infinite: eiss_carousel_loop ? true : false,
            speed: 300,
            autoplay: eiss_carousel_autoplay > 0 ? true : false,
            autoplaySpeed: eiss_carousel_delay > 0 ? eiss_carousel_delay : 5000,
            slidesToShow: eiss_per_row_desktop,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: eiss_per_row_tablet,
                        slidesToScroll: eiss_per_row_tablet
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: eiss_per_row_mobile,
                        slidesToScroll: eiss_per_row_mobile
                    }
                }
            ]
        });

        eiss_section.find('.ets-iss-photos .eiss-item').css({
            'padding-right': padding_right + 'px',
            'padding-bottom': photo_spacing + 'px'
        });
    }
}

function eissInitFancybox(section_element) {
    jQueryETS(section_element).find('.eiss-fancybox-item').fancybox({
        buttons: [
            'slideShow',
            'thumbs',
            'share',
            'close'
        ],
        baseClass: 'eiss-fancybox',
        slideClass: 'eiss-fancybox-slide',
        loop: false,
        toolbar: true,
        touch: false,
        closeBtn: false,
        wheel: false,
        zoomOpacity: 0,
        transitionDuration: 100,
        video: {
            autoStart: false
        },
        beforeShow: function (instance, current) {
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content .eiss-product-tag-item').remove();
            if (jQueryETS(section_element).find(' .eiss_item_photo_' + current.opts.idmedia + ' .eiss-fancybox-item').hasClass('hover-point-tagged')) {
                jQueryETS.fancybox.close();
            }
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').remove();
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').css('opacity', 0);
            etsInsta.getVideoInsta(current.opts.link, current.opts.idmedia);
        },
        afterShow: function (instance, current) {
            if (jQueryETS(window).width() <= 768) {
                jQueryETS('.eiss-fancybox').addClass('eiss-fancybox-show-nav');
            }
            var box_height = jQueryETS('.eiss-fancybox').height();
            var photo_x = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').height();
            var padding_top_slide = (box_height - photo_x) / 2;
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current').css('padding-top', padding_top_slide + 'px');
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').attr({
                "data-idmedia": current.opts.idmedia,
                "data-likes": current.opts.likes,
                "data-comments": current.opts.comments,
                "data-links": current.opts.links,
                "data-tus": current.opts.tus,
                "data-tags": current.opts.tags,
                "data-cat": current.opts.cat,
                "data-thumb_src": current.opts.thumb_src,
                "data-media_src": current.opts.media_src,
                "data-userprofile": current.opts.userprofile,
                "data-username": current.opts.username,
                "data-viewcart": current.opts.view_cart
            });

            if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content .eiss-photo-product-tags').length == 0) {
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').append('<div class="eiss-photo-product-tags"></div>');
            }
            if (jQueryETS(section_element).find('.eiss_item_photo_' + current.opts.idmedia + ':first .eiss-product-tag-item').length && current.opts.cat != 'video') {
                var tag_point_html = '';
                jQueryETS(section_element).find('.eiss_item_photo_' + current.opts.idmedia + ':first .eiss-product-tag-item').each(function (index_tag, el) {
                    tag_point_html += '<div class="eiss-product-tag-item tagged eiss_tag_point_' + jQueryETS(this).attr('data-tag-id') + '" title="' + jQueryETS(this).attr('data-product-title') + '" data-photo-width="' + jQueryETS(this).attr('data-photo-width') + '" data-photo-height="' + jQueryETS(this).attr('data-photo-height') + '" data-idmedia="' + jQueryETS(this).attr('data-idmedia') + '" style="top: ' + jQueryETS(this).attr('data-position-top') + 'px; left: ' + jQueryETS(this).attr('data-position-left') + 'px;" data-position-top="' + jQueryETS(this).attr('data-position-top') + '" data-position-left="' + jQueryETS(this).attr('data-position-left') + '" data-tag-key="' + (index_tag + 1) + '" data-tag-id="' + jQueryETS(this).attr('data-tag-id') + '" data-product-handle="' + jQueryETS(this).attr('data-product-handle') + '">';
                    tag_point_html += (index_tag + 1);
                    tag_point_html += '</div>';
                });
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content .eiss-photo-product-tags').append(tag_point_html);
            }
            if (true) {
                var popup_left = '<div class="eiss-fancybox-popup-left">';
                popup_left += '<div class="eiss-list-product-tagged eiss-append-tagged-products">';
                if (typeof current.opts.username !== 'undefined' && current.opts.username !== 'undefined' && current.opts.username) {
                    popup_left += '<div class="eiss-fancybox-userdata">';
                    if(typeof current.opts.userprofile !== 'undefined' && current.opts.userprofile)
                        popup_left += '<div class="eiss-userprofile"><img src="' + current.opts.userprofile + '" class="eiss-user-avatar" onerror="eissProfileImageError(this)"></div>';
                    popup_left += '<div class="eiss-username"><span><a href="https://instagram.com/' + current.opts.username + '" target="_blank">' + current.opts.username + '</a></span></div>';
                    popup_left += '<div class="eiss-user-follow"><a href="https://instagram.com/' + current.opts.username + '" class="eiss-link-follow" target="_blank">Follow</a></div>';
                    popup_left += '</div>';
                }
                if (typeof ETS_ISS_TAG_CACHE_DATA.data !== 'undefined' && ETS_ISS_TAG_CACHE_DATA.data.length > 0) {
                    if (jQueryETS(section_element).find('.eiss_item_photo_' + current.opts.idmedia + ':first .eiss-product-tag-item').length) {
                        popup_left += '<div class="eiss-caption-tagged-product"><span>Related products</span></div>';
                        popup_left += '<div class="eiss-list-tagged-products__results ' + (current.opts.cat == 'video' ? 'video-tags' : '') + '" ' + (!current.opts.tus ? 'style="border-bottom: none;"' : '') + '>';

                        jQueryETS(section_element).find('.eiss_item_photo_' + current.opts.idmedia + ':first .eiss-product-tag-item').each(function (index_tag, el_tag) {
                            popup_left += '<div class="eiss-tagged-product-item eiss_tag_product_' + jQueryETS(this).attr('data-tag-id') + '" data-tag-id="' + jQueryETS(this).attr('data-tag-id') + '" data-idmedia="' + current.opts.idmedia + '">';
                            popup_left += '<a href="/products/' + jQueryETS(this).attr('data-product-handle') + '" class="eiss-link-target-product">';
                            if (current.opts.cat != 'video') {
                                popup_left += '<div class="eiss-tagged-product-point">' + (index_tag + 1) + '</div>';
                            }
                            popup_left += '<div class="eiss-tagged-product-item__image">';
                            if (jQueryETS(this).attr('data-product-image') && jQueryETS(this).attr('data-product-image') != 'null') {
                                popup_left += '<img src="' + jQueryETS(this).attr('data-product-image') + '" alt="' + jQueryETS(this).attr('data-tag-id') + '">';
                            }
                            popup_left += '</div>';
                            popup_left += '<div class="eiss-tagged-product-item__body">';
                            popup_left += '<span class="eiss-product-title">' + jQueryETS(this).attr('data-product-title') + '</span>';
                            popup_left += '<span class="eiss-variant-title">' + (jQueryETS(this).attr('data-variant-title') != 'null' ? jQueryETS(this).attr('data-variant-title') : '') + '</span>';
                            popup_left += '</div>';
                            popup_left += '<div class="eiss-tagged-product-item__action">';
                            popup_left += '<span>' + jQueryETS(this).attr('data-product-price') + ' ' + jQueryETS(this).attr('data-currency') + '</span>';
                            if (jQueryETS(window).width() <= 768) {
                                popup_left += '<button class="eiss-btn-tagged-product-add-card cart-modile" data-variant="' + jQueryETS(this).attr('data-variant-id') + '"></button>';
                            }
                            popup_left += '</div>';
                            popup_left += '</a>';
                            if (jQueryETS(window).width() > 768) {
                                popup_left += '<button class="eiss-btn-tagged-product-add-card" data-variant="' + jQueryETS(this).attr('data-variant-id') + '">Add to cart</button>';
                            }
                            popup_left += '</div>';
                        });
                        popup_left += '</div>';
                    }

                }

                if (current.opts.tus) {
                    popup_left += '<div class="eiss-fancybox-desc"><span>';
                    if (current.opts.tags) {
                        var photo_tags = current.opts.tags.split(',');
                        var photo_tus = current.opts.tus;
                        photo_tus = eissAddHashtag(photo_tus);

                        tag_replaced = [];
                        popup_left += photo_tus.replace('\n', '<br>');
                    } else {
                        popup_left += eissAddHashtag(current.opts.tus);
                    }
                    popup_left += '</span></div>';
                }
                popup_left += '<div class="eiss-fancybox-metadata">';
                if (current.opts.likes) {
                    popup_left += '<span class="eiss-fancybox-metadata-likes">' + current.opts.likes + ' Likes</span>';
                }
                if (current.opts.created_time) {
                    var fDate = new Date(parseInt(current.opts.created_time) * 1000);
                    popup_left += '<span class="eiss-fancybox-metadata-time">' + eissGetMonth(fDate.getMonth()) + ' ' + eissGetDayNTH(fDate.getDate()) + ' ' + fDate.getFullYear() + '</span>'
                }
                popup_left += '</div>';
                if (current.opts.comments) {
                    popup_left += '<div class="eiss-fancybox-post-comments"></div>';
                }
                popup_left += '</div>';

                popup_left += '<div class="eiss-fancybox-popup-left__footer">';
                popup_left += '<div class="eiss-fancybox-popup-left__footer_action">';
                popup_left += '<div class="eiss-fancybox-link-insta">';
                popup_left += '<a href="' + current.opts.link + '" class="eiss-target-photo-link" target="_blank">' + (current.opts.cat == 'video' ? "Open this video on Instagram to like or comment" : "Open this photo on Instagram to like or comment") + '</a>';
                popup_left += '</div>';
                popup_left += '<div class="eiss-fancybox-group-share">';
                popup_left += '<a title="Share on facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + current.opts.link + '" target="_blank" class="eiss-photo-share facebook"></a>';
                popup_left += '<a title="Share on twitter" href="https://twitter.com/intent/tweet?url=' + current.opts.link + '" target="_blank" class="eiss-photo-share twitter"></a>';
                popup_left += '<a title="Share on pinterest" href="http://pinterest.com/pin/create/button/?url=' + current.opts.link + '&media=' + current.opts.url + '" target="_blank" class="eiss-photo-share pinterest"></a>';
                popup_left += '<a title="Share on tumblr" href="http://www.tumblr.com/share/link?url=' + current.opts.link + '" target="_blank" class="eiss-photo-share tumblr"></a>';
                popup_left += '</div>';
                popup_left += '</div>';
                popup_left += '</div>';

                popup_left += '</div>';

                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current').append(popup_left);
                if (current.opts.comments && current.opts.show_comment == 1) {
                    eissGetPostComments(section_element, current.opts.idmedia);
                }

                //Set height for popup left
                var height_set = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').length ? jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content video').height() : jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content img').height();
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').css('height', height_set);
                eissCalculatePositionTag(section_element, true);
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').animate({opacity: 1});
                jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-fancybox-popup-left').animate({opacity: 1});
                if (current.opts.cat == 'video') {
                    //var eiss_video_slider = document.getElementById(current.opts.idvideo);
                    var eiss_video_slider = document.querySelector('.eiss-fancybox-slide.fancybox-slide--current video');
                    if (typeof eiss_video_slider !== 'undefined' && eiss_video_slider && jQueryETS(window).width() > 768) {
                        eiss_video_slider.play();
                    }
                }
            }

            //mobile event
            var lastY;
            var currentY;
            var eiss_touch_element = document.querySelector('.eiss-fancybox .fancybox-stage');
            eiss_touch_element.addEventListener('touchstart', function (e) {
                if (jQueryETS(e.target).is('.eiss-product-tag-item')) {
                    jQueryETS(e.target).click();
                }

                currentY = e.changedTouches[0].clientY;
                lastY = currentY;

            }, false);
            eiss_touch_element.addEventListener('touchmove', function (e) {
                currentY = e.touches[0].clientY;
                delta = currentY - lastY;

                this.scrollTop += delta * -1;
                lastY = currentY;

            }, false);


        }
    });

}

function eissGetPhotos(width_browser, request_data, first_load, sectionId) {
    var request_data = typeof request_data !== 'undefined' ? request_data : false;
    var first_load = typeof first_load !== 'undefined' ? first_load : false;
    var sectionId = typeof sectionId !== 'undefined' ? sectionId : '';
    var url_request = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + ETS_ISS_ACCESS_TOKEN;
    if (first_load && ETS_ISS_INIT_CACHE_URL && ETS_ISS_INIT_CACHE_URL !== "{INIT_CACHE_URL}") {
        url_request = ETS_ISS_INIT_CACHE_URL;
    }
    if (sectionId && jQueryETS('#shopify-section-' + sectionId + ' .ets-instagram-ss').length) {
        eissGetSessionPhoto('#shopify-section-' + sectionId + ' .ets-instagram-ss', url_request, width_browser, request_data, first_load, true);
    } else {
        jQueryETS('.ets-instagram-ss').each(function (index, el) {
            eissGetSessionPhoto(this, url_request, width_browser, request_data, first_load);
        });
    }

}

function eissGetRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function eissUpdateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

function eissCalculatePositionTag(section, for_slide) {
    for_slide = typeof for_slide !== 'undefined' ? for_slide : '';
    if (for_slide) {
        if (jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-content').attr('data-cat') != 'video' && jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-photo-product-tags .eiss-product-tag-item.tagged').length) {
            var photo_width = jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').first().width();
            var img_width = parseFloat(jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').width());
            var img_height = parseFloat(jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .fancybox-image').height());

            var real_img_width = parseFloat(jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-photo-product-tags .eiss-product-tag-item.tagged').first().attr('data-photo-width'));
            var real_img_height = parseFloat(jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-photo-product-tags .eiss-product-tag-item.tagged').first().attr('data-photo-height'));
            var ratio = photo_width / real_img_width;
            jQueryETS('.eiss-fancybox-slide.fancybox-slide--current .eiss-photo-product-tags .eiss-product-tag-item.tagged').each(function (index, el) {
                jQueryETS(this).css({
                    left: jQueryETS(this).attr('data-position-left') * ratio - 10,
                    top: jQueryETS(this).attr('data-position-top') * ratio - 10
                });
                jQueryETS(this).removeClass('hidden');
            });
        }

    } else {
        jQueryETS(section).find('.ets-iss-photos .eiss-item').each(function (index, el) {
            if (jQueryETS(this).find('.eiss-fancybox-item').attr('data-cat') != 'video' && jQueryETS(this).find('.eiss-product-tag-item').length) {

                photo_width = jQueryETS(section).find('.eiss-item .eiss-outer-img').first().width();
                var img_width = parseFloat(jQueryETS(this).find('img.ets-iss-img').width());
                var img_height = parseFloat(jQueryETS(this).find('img.ets-iss-img').height());
                var real_img_width = parseFloat(jQueryETS(this).find('.eiss-product-tag-item').first().attr('data-photo-width'));
                var real_img_height = parseFloat(jQueryETS(this).find('.eiss-product-tag-item').first().attr('data-photo-height'));
                var ratio = real_img_width < real_img_height ? photo_width / real_img_width : photo_width / real_img_height;

                jQueryETS(this).find('.eiss-product-tag-item').each(function (index, el) {
                    jQueryETS(this).css({
                        left: jQueryETS(this).attr('data-position-left') * ratio - 10,
                        top: jQueryETS(this).attr('data-position-top') * ratio - 10
                    });
                    jQueryETS(this).removeClass('hidden');
                });
            }

        });
    }

}

function eissSetHeightPhoto(section, myimage, onload) {

    photo_width = jQueryETS(section).find('.eiss-item .eiss-outer-img').first().width();
    if (photo_width < 50) {
        photo_width = parseFloat(localStorage.getItem('eiss_img_height'));
    }
    jQueryETS(section).find('.eiss-item .eiss-outer-img').css('height', parseFloat(photo_width) + 'px');
    jQueryETS(section).find('.eiss-item').css('height', 'auto');
    localStorage.setItem('eiss_img_height', photo_width);
    if (myimage) {
        if (onload) {
            setTimeout(function () {
                eissSetHeightPhotoItem(jQueryETS(myimage).closest('.eiss-item'), photo_width);
            }, 300);
        } else
            eissSetHeightPhotoItem(jQueryETS(myimage).closest('.eiss-item'), photo_width);
    } else {
        jQueryETS(section).find('.eiss-item').each(function (index, el) {
            eissSetHeightPhotoItem(this, photo_width);
        });
    }

}

function eissSetHeightPhotoItem(item, photo_width) {
    var img_width = jQueryETS(item).find('img.ets-iss-img').width();
    var img_height = jQueryETS(item).find('img.ets-iss-img').height();

    if (img_width < img_height) {
        var ratio = photo_width / img_width;
        var margin = (img_height * ratio - photo_width) / -2;
        jQueryETS(item).find('.eiss-box-outer-tag-photo').css({
            "margin-top": margin,
            'width': '100%',
            "margin-left": '0'
        });
        jQueryETS(item).find('.ets-iss-img').css('width', '100%');
    } else if (img_width > img_height) {
        var ratio = photo_width / img_height;
        var margin = (img_width * ratio - photo_width) / -2;
        jQueryETS(item).find('.eiss-box-outer-tag-photo').css({
            "margin-left": margin,
            'height': '100%',
            "margin-top": '0'
        });
        jQueryETS(item).find('.ets-iss-img').css('height', '100%');
    } else {
        jQueryETS(item).find('.eiss-box-outer-tag-photo').css({'width': '100%', 'margin': '0'});
        jQueryETS(item).find('.ets-iss-img').css({'width': '100%'});
    }
    jQueryETS(item).removeClass('eiss-opacity-hide');
    if (photo_width > 150) {
        jQueryETS(item).find('.eiss-btn-show-slide-photo').removeClass('hide');
        if (photo_width <= 220) {
            jQueryETS(item).find('.eiss-btn-show-slide-photo').addClass('sm');
        } else {
            jQueryETS(item).find('.eiss-btn-show-slide-photo').removeClass('sm');
        }
        jQueryETS(item).find('.eiss-btn-show-slide-photo').css('left', 'calc(50% - ' + (jQueryETS(item).find('.eiss-btn-show-slide-photo').outerWidth(true) / 2) + 'px)');
        jQueryETS(item).find('.eiss-btn-show-slide-photo').css('top', 'calc(50% - ' + (jQueryETS(item).find('.eiss-btn-show-slide-photo').outerHeight(true) / 2) + 'px)');
    }
}

function eissSetPosImg(section) {
    var photos = jQueryETS(section).find('img.ets-iss-img');
    if (photos.length) {
        photos.on('load', function () {
            if (jQueryETS(this).width() && jQueryETS(this).height()) {
                eissSetHeightPhoto(section, this, true);
            }
        });
    }
}

function eissGetFeaturedPhotos(photos, length) {
    var length = typeof length !== 'undefined' ? length : 0;
    var featured = [];
    var count = 0;
    for (var i = 0; i < photos.length; i++) {
        if (typeof photos[i].featured !== 'undefined' && photos[i].featured) {
            featured.push(photos[i]);
            count++;
            if (length && count == length) {
                break;
            }
        }

    }

    return featured;
}

function eissGetTaggedPhotos(photos, length, product_id) {
    var length = typeof length !== 'undefined' ? length : 0;
    var tagged = [];
    var count = 0;
    for (var i = 0; i < photos.length; i++) {
        if (typeof photos[i].product_tags !== 'undefined' && photos[i].product_tags.length > 0) {
            if (product_id) {
                for (var k = 0; k < photos[i].product_tags.length; k++) {
                    if (product_id == photos[i].product_tags[k].product_id) {
                        tagged.push(photos[i]);
                        count++;
                        break;
                    }
                }
            } else {
                tagged.push(photos[i]);
                count++;
            }
        }
        if (length && count >= length) {
            break;
        }
    }
    return tagged;
}

function eissSortArrayAsc(array, key) {
    for (var i = 0; i < array.length - 1; i++) {
        for (var j = i + 1; j < array.length; j++) {
            if (typeof array[i][key] == 'undefined') {
                array[i][key] = 0;
            }
            if (typeof array[j][key] == 'undefined') {
                array[j][key] = 0;
            }

            if (array[j][key] < array[i][key]) {
                var tmp = array[i];
                array[i] = array[j];
                array[j] = tmp;
            }
        }
    }

    return array;
}

function eissToastSuccess(message) {
    var toast = '<div class="eiss-toast">';
    toast += '<div class="eiss-toast-content">';
    toast += '<span class="close js-eiss-close-toast">&times;</span>';
    toast += '<div class="eiss-toast-body">' + message + '</div>';
    toast += '</div>';
    toast += '</div>';
    jQueryETS('body .eiss-toast').remove();
    jQueryETS('body').append(toast);
    setTimeout(function () {
        jQueryETS('body .eiss-toast').remove();
    }, 5000);
}

function eissAddslashes(text) {

    return text.replace(/"/g, "'");
}

function eissCheckPhotoError(section) {
    var photos = jQueryETS(section).find('img.ets-iss-img ');
    if (photos.length) {
        photos.on('error', function (event) {
            if (!eiss_break_request) {
                eissProccessPhotoError(section, jQueryETS(this).closest('.eiss-fancybox-item').attr('data-idmedia'), jQueryETS(this).attr('src'));
            }
        });

    }
}

function eissProccessPhotoError(section, id_media, img_src) {
    if (typeof ETS_ISS_APP_URL === 'undefined') {
        return;
    }
    var photo = jQueryETS(section).find('img.ets-iss-img ');
    var shop_id = typeof EISS_SHOP_ID !== 'undefined' && EISS_SHOP_ID !== '{SHOP_ID}' ? EISS_SHOP_ID : '';
    if (photo.length > 0) {
        jQueryETS.ajax({
            url: ETS_ISS_APP_URL + '/clients/update-photo-error',
            type: 'POST',
            data: {
                media_id: id_media,
                img_src: img_src,
                shop_id: shop_id,
                shop: window.location.hostname.replace('wwww.', ''),
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    if (typeof res.media !== 'undefined' && typeof res.media.thumb_src !== 'undefined') {
                        jQueryETS('.eiss_item_photo_' + id_media + ' img.ets-iss-img').attr('src', res.media.thumb_src);
                        jQueryETS('.eiss_item_photo_' + id_media + ' .eiss-fancybox-item').attr('href', res.media.media_src);
                        eissSetHeightPhoto(section, null);
                        eissCalculatePositionTag(section);
                    } else {
                        if (photo.closest('.slick-slide').length) {
                            photo.closest('.slick-slide').remove();
                        } else {
                            photo.closest('.instagram-photo').remove();
                        }
                    }
                } else {
                    if (typeof res.break_request !== 'undefined' && res.break_request) {
                        eiss_break_request = 1;
                    }
                }
            },
            error: function () {

            }
        });
    }
}

function eissProfileImageError(photo) {
    jQueryETS(photo).parent('.eiss-userprofile').remove();

}

function eissGetPostComments(section_element, media_id) {
    if (!jQueryETS(section_element).find('.eiss_item_photo_' + media_id + ' .eiss-comments-saved').length) {
        jQueryETS.ajax({
            url: 'https://api.instagram.com/v1/media/' + media_id + '/comments?access_token=' + ETS_ISS_ACCESS_TOKEN,
            type: 'GET',
            dataType: 'jsonp',
            beforeSend: function () {
                jQueryETS('.eiss-fancybox-post-comments').html('<div class="eiss-comment-loading"><div class="eiss-comment-loader"></div></div>')
            },
            success: function (res) {
                if (typeof res.data !== 'undefined') {
                    var comments = res.data;
                    var html = '';
                    for (var i = 0; i < comments.length; i++) {
                        html += '<div class="eiss-comment-item">';
                        html += '<div class="eiss-comment-user">';
                        if (typeof comments[i].from.profile_picture !== 'undefined')
                            html += '<a class="link-profile-comment" href="https://api.instagram.com/' + comments[i].from.username + '" target="_blank" title="' + comments[i].from.username + '"><img src="' + comments[i].from.profile_picture + '" alt="" class="img-comment"></a>';
                        html += '<a href="https://api.instagram.com/' + comments[i].from.username + '" target="_blank" title="' + comments[i].from.username + '">' + comments[i].from.username + '</a></div>';

                        html += '<div class="eiss-comment-text">' + eissAddHashtag(comments[i].text) + '</div>';
                        html += '</div>';
                    }
                    jQueryETS('.eiss-fancybox-post-comments').html(html);
                    if (html) {
                        jQueryETS(section_element).find('.eiss_item_photo_' + media_id).append('<div class="eiss-comments-saved">' + html + '</div>');
                    }
                }
            },
            complete: function () {
                jQueryETS('.eiss-fancybox-post-comments .eiss-comment-loading').remove();
            }
        });
    } else {
        var comment_html = jQueryETS(section_element).find('.eiss_item_photo_' + media_id + ' .eiss-comments-saved').html();
        jQueryETS('.eiss-fancybox-post-comments').html(comment_html);
    }

}

function eissAddHashtag(str) {
    str = str.replace(/#(\S*)/g, '<a href="https://www.instagram.com/explore/tags/$1/" class="eiss-photo-tag" target="_blank">#$1</a>');
    str = str.replace(/@(\S*)/g, '<a href="https://www.instagram.com/$1/" class="eiss-photo-tag" target="_blank">@$1</a>');
    str = eiss_nl2br(str, true);
    return str;
}

function eiss_nl2br(str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}


function eissGetMonth(m) {
    //m start from 0
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[m];
}

function eissGetDayNTH(d) {
    if (d > 3 && d < 21) return d + 'th';
    switch (d % 10) {
        case 1:
            return d + "st";
        case 2:
            return d + "nd";
        case 3:
            return d + "rd";
        default:
            return d + "th";
    }
}

function eissScrollAutoLoad(idSection) {
    if (jQueryETS('#' + idSection + ' .js-eiss-loadmore-photo').length
        && jQueryETS(window).scrollTop() + jQueryETS(window).height() >= jQueryETS('#' + idSection).offset().top + jQueryETS('#' + idSection).height()) {
        jQueryETS('#' + idSection + ' .js-eiss-loadmore-photo').click();
    }
}

