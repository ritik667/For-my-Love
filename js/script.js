"use strict";

window.AllowBackFromHistory = false;

function CheckLocation() {
    var start = "#go_to_message";
    var hash = location.hash;
    if (hash.substr(0, start.length) === start) {
        var messageId = parseInt(hash.substr(start.length));
        if (messageId) {
            GoToMessage(messageId);
        }
    } else if (hash === "#allow_back") {
        window.AllowBackFromHistory = true;
    }
}

function ShowToast(text) {
    var container = document.createElement("div");
    container.className = "toast_container";
    var inner = container.appendChild(document.createElement("div"));
    inner.className = "toast_body";
    inner.appendChild(document.createTextNode(text));
    var appended = document.body.appendChild(container);
    setTimeout(function () {
        AddClass(appended, "toast_shown");
        setTimeout(function () {
            RemoveClass(appended, "toast_shown");
            setTimeout(function () {
                document.body.removeChild(appended);
            }, 3000);
        }, 3000);
    }, 0);
}

function ShowHashtag(tag) {
    ShowToast("This is a hashtag '#" + tag + "' link.");
    return false;
}

function ShowCashtag(tag) {
    ShowToast("This is a cashtag '$" + tag + "' link.");
    return false;
}

function ShowBotCommand(command) {
    ShowToast("This is a bot command '/" + command + "' link.");
    return false;
}

function ShowMentionName() {
    ShowToast("This is a link to a user mentioned by name.");
    return false;
}

function ShowNotLoadedEmoji() {
    ShowToast("This custom emoji is not included, change data exporting settings to download.");
    return false;
}

function ShowNotAvailableEmoji() {
    ShowToast("This custom emoji is not available.");
    return false;
}

function ShowTextCopied(content) {
    navigator.clipboard.writeText(content);
    ShowToast("Text copied to clipboard.");
    return false;
}

function ShowSpoiler(target) {
    if (target.classList.contains("hidden")) {
        target.classList.toggle("hidden");
    }
}

function AddClass(element, name) {
    var current = element.className;
    var expression = new RegExp('(^|\\s)' + name + '(\\s|$)', 'g');
    if (expression.test(current)) {
        return;
    }
    element.className = current + ' ' + name;
}

function RemoveClass(element, name) {
    var current = element.className;
    var expression = new RegExp('(^|\\s)' + name + '(\\s|$)', '');
    var match = expression.exec(current);
    while ((match = expression.exec(current)) != null) {
        if (match[1].length > 0 && match[2].length > 0) {
            current = current.substr(0, match.index + match[1].length)
                + current.substr(match.index + match[0].length);
        } else {
            current = current.substr(0, match.index)
                + current.substr(match.index + match[0].length);
        }
    }
    element.className = current;
}

function EaseOutQuad(t) {
    return t * t;
}

function EaseInOutQuad(t) {
    return (t < 0.5) ? (2 * t * t) : ((4 - 2 * t) * t - 1);
}

function ScrollHeight() {
    if ("innerHeight" in window) {
        return window.innerHeight;
    } else if (document.documentElement) {
        return document.documentElement.clientHeight;
    }
    return document.body.clientHeight;
}

function ScrollTo(top, callback) {
    var html = document.documentElement;
    var current = html.scrollTop;
    var delta = top - current;
    var finish = function () {
        html.scrollTop = top;
        if (callback) {
            callback();
        }
    };
    if (!window.performance.now || delta == 0) {
        finish();
        return;
    }
    var transition = EaseOutQuad;
    var max = 300;
    if (delta < -max) {
        current = top + max;
        delta = -max;
    } else if (delta > max) {
        current = top - max;
        delta = max;
    } else {
        transition = EaseInOutQuad;
    }
    var duration = 150;
    var interval = 7;
    var time = window.performance.now();
    var animate = function () {
        var now = window.performance.now();
        if (now >= time + duration) {
            finish();
            return;
        }
        var dt = (now - time) / duration;
        html.scrollTop = Math.round(current + delta * transition(dt));
        setTimeout(animate, interval);
    };
    setTimeout(animate, interval);
}

function ScrollToElement(element, callback) {
    var header = document.getElementsByClassName("page_header")[0];
    var headerHeight = header.offsetHeight;
    var html = document.documentElement;
    var scrollHeight = ScrollHeight();
    var available = scrollHeight - headerHeight;
    var padding = 10;
    var top = element.offsetTop;
    var height = element.offsetHeight;
    var desired = top
        - Math.max((available - height) / 2, padding)
        - headerHeight;
    var scrollTopMax = html.offsetHeight - scrollHeight;
    ScrollTo(Math.min(desired, scrollTopMax), callback);
}

function GoToMessage(messageId) {
    var element = document.getElementById("message" + messageId);
    if (element) {
        var hash = "#go_to_message" + messageId;
        if (location.hash !== hash) {
            location.hash = hash;
        }
        ScrollToElement(element, function () {
            AddClass(element, "selected");
            setTimeout(function () {
                RemoveClass(element, "selected");
            }, 1000);
        });
    } else {
        ShowToast("This message was not exported. Maybe it was deleted.");
    }
    return false;
}

function GoBack(anchor) {
    if (!window.AllowBackFromHistory) {
        return true;
    }
    history.back();
    if (!anchor || !anchor.getAttribute) {
        return true;
    }
    var destination = anchor.getAttribute("href");
    if (!destination) {
        return true;
    }
    setTimeout(function () {
        location.href = destination;
    }, 100);
    return false;
}

// Call the CheckLocation function on load
window.addEventListener("load", CheckLocation);

document.addEventListener("DOMContentLoaded", function () {
    // Create buttons
    const jumpToTopButton = document.createElement("button");
    const jumpToBottomButton = document.createElement("button");
    const backToChatListButton = document.createElement("button");

    // Set button text
    jumpToTopButton.textContent = "⬆️";
    jumpToBottomButton.textContent = "⬇️";
    backToChatListButton.textContent = "🔙";

    // Inline styling for buttons
    const buttonStyle = `
        position: fixed;
        width: 50px;
        height: 50px;
        background-color: #6a89cc;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        font-size: 1.5em;
        text-align: center;
        line-height: 1.5;
        transition: all 0.3s ease;
    `;

    // Apply styles to Jump to Top and Bottom buttons
    jumpToTopButton.style.cssText = buttonStyle;
    jumpToBottomButton.style.cssText = buttonStyle;
    backToChatListButton.style.cssText = buttonStyle;

    // Position the buttons
    jumpToTopButton.style.bottom = "30px";
    jumpToTopButton.style.right = "25px";
    jumpToBottomButton.style.bottom = "90px";
    jumpToBottomButton.style.right = "25px";
    backToChatListButton.style.bottom = "30px";
    backToChatListButton.style.left = "25px";

    // Add hover effect
    const hoverColor = "#4863a0";
    [jumpToTopButton, jumpToBottomButton, backToChatListButton].forEach(button => {
        button.addEventListener("mouseover", () => button.style.backgroundColor = hoverColor);
        button.addEventListener("mouseout", () => button.style.backgroundColor = "#6a89cc");
    });

    // Add scroll functionality to Jump buttons
    jumpToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    jumpToBottomButton.addEventListener("click", () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

    // Navigate to index.html for Back to Chat List button
    backToChatListButton.addEventListener("click", () => window.location.href = "index.html");

    // Append buttons to the body
    document.body.appendChild(jumpToTopButton);
    document.body.appendChild(jumpToBottomButton);
    document.body.appendChild(backToChatListButton);
});


