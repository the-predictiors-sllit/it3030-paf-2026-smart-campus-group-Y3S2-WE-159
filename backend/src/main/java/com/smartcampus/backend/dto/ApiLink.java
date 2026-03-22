package com.smartcampus.backend.dto;

public class ApiLink {

    private String href;
    private String method;

    public ApiLink() {
    }

    public ApiLink(String href) {
        this.href = href;
    }

    public ApiLink(String href, String method) {
        this.href = href;
        this.method = method;
    }

    public String getHref() {
        return href;
    }

    public void setHref(String href) {
        this.href = href;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}
