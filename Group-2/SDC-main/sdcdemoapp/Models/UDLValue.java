package com.example.sdcdemoapp.Models;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

public class UDLValue implements Parcelable {
    private int ID = -1;
    private float magnitude = 0;
    private String loadType = "";
    private String anchor = "";
    private float span = 0;
    private float dist_from_left = 0;

    public float getMagnitude() {
        return magnitude;
    }

    public void setMagnitude(float magnitude) {
        this.magnitude = magnitude;
    }

    public float getSpan() {
        return span;
    }

    public void setSpan(float span) {
        this.span = span;
    }

    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    public UDLValue(){

    }

    public String getLoadType() {
        return loadType;
    }

    public void setLoadType(String loadType) {
        this.loadType = loadType;
    }

    public UDLValue(int id){
        this.ID = id;
    }

    public String getAnchor() {
        return anchor;
    }

    public void setAnchor(String anchor) {
        this.anchor = anchor;
    }

    public float getDist_from_left() {
        return dist_from_left;
    }

    public void setDist_from_left(float dist_from_left) {
        this.dist_from_left = dist_from_left;
    }

    protected UDLValue(Parcel in) {
        ID = in.readInt();
        magnitude = in.readFloat();
        loadType = in.readString();
        anchor = in.readString();
        span = in.readFloat();
        dist_from_left = in.readFloat();
    }

    public static final Creator<UDLValue> CREATOR = new Creator<UDLValue>() {
        @Override
        public UDLValue createFromParcel(Parcel in) {
            return new UDLValue(in);
        }

        @Override
        public UDLValue[] newArray(int size) {
            return new UDLValue[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(@NonNull Parcel dest, int flags) {
        dest.writeInt(ID);
        dest.writeFloat(magnitude);
        dest.writeString(loadType);
        dest.writeString(anchor);
        dest.writeFloat(span);
        dest.writeFloat(dist_from_left);
    }
}
