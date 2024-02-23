package com.example.sdcdemoapp.Models;

import android.os.Parcel;
import android.os.Parcelable;

import androidx.annotation.NonNull;

import java.util.ArrayList;

public class Span implements Parcelable {
    int id = -1;
    private boolean isSelected = false;
    private int plCount = 0;
    private int udlCount = 0;
    private int uvlCount = 0;
    private float spanLength = 0;
    private float settlement_r = 0;
    private float settlement_l = 0;
    private float angle_r = 0;
    private float angle_l = 0;
    private float coeff_I = 1;
    private float a_left;
    private float b_left;
    private float c_left;
    private float a_right;
    private float b_right;
    private float c_right;
    private String leftSupport = "";
    private String rightSupport = "";
    private ArrayList<PLValue> plValues = new ArrayList<>();
    private ArrayList<UDLValue> udlValues = new ArrayList<>();
    private ArrayList<UVLValue> uvlValues = new ArrayList();
    private float leftMoment = 0;
    private float rightMoment = 0;

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }

    public int getPlCount() {
        return plCount;
    }

    public void setPlCount(int plCount) {
        this.plCount = plCount;
    }

    public int getUdlCount() {
        return udlCount;
    }

    public void setUdlCount(int udlCount) {
        this.udlCount = udlCount;
    }

    public int getUvlCount() {
        return uvlCount;
    }

    public void setUvlCount(int uvlCount) {
        this.uvlCount = uvlCount;
    }

    public float getSpanLength() {
        return spanLength;
    }

    public void setSpanLength(float spanLength) {
        this.spanLength = spanLength;
    }

    public float getSettlement_r() {
        return settlement_r;
    }

    public void setSettlement_r(float settlement_r) {
        this.settlement_r = settlement_r;
    }

    public String getLeftSupport() {
        return leftSupport;
    }

    public void setLeftSupport(String leftSupport) {
        this.leftSupport = leftSupport;
    }

    public String getRightSupport() {
        return rightSupport;
    }

    public float getSettlement_l() {
        return settlement_l;
    }

    public void setSettlement_l(float settlement_l) {
        this.settlement_l = settlement_l;
    }

    public void setRightSupport(String rightSupport) {
        this.rightSupport = rightSupport;
    }

    public ArrayList<PLValue> getPlValues() {
        return plValues;
    }

    public void setPlValues(ArrayList<PLValue> plValues) {
        this.plValues = plValues;
    }

    public ArrayList<UDLValue> getUdlValues() {
        return udlValues;
    }

    public void setUdlValues(ArrayList<UDLValue> udlValues) {
        this.udlValues = udlValues;
    }

    public ArrayList<UVLValue> getUvlValues() {
        return uvlValues;
    }

    public void setUvlValues(ArrayList<UVLValue> uvlValues) {
        this.uvlValues = uvlValues;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public float getAngle_r() {
        return angle_r;
    }

    public void setAngle_r(float angle_r) {
        this.angle_r = angle_r;
    }

    public float getAngle_l() {
        return angle_l;
    }

    public void setAngle_l(float angle_l) {
        this.angle_l = angle_l;
    }

    public float getCoeff_I() {
        return coeff_I;
    }

    public void setCoeff_I(float coeff_I) {
        this.coeff_I = coeff_I;
    }

    public float getA_left() {
        return a_left;
    }

    public void setA_left(float a_left) {
        this.a_left = a_left;
    }

    public float getB_left() {
        return b_left;
    }

    public void setB_left(float b_left) {
        this.b_left = b_left;
    }

    public float getC_left() {
        return c_left;
    }

    public void setC_left(float c_left) {
        this.c_left = c_left;
    }

    public float getA_right() {
        return a_right;
    }

    public void setA_right(float a_right) {
        this.a_right = a_right;
    }

    public float getB_right() {
        return b_right;
    }

    public void setB_right(float b_right) {
        this.b_right = b_right;
    }

    public float getC_right() {
        return c_right;
    }

    public void setC_right(float c_right) {
        this.c_right = c_right;
    }

    public float getLeftMoment() {
        return leftMoment;
    }

    public void setLeftMoment(float leftMoment) {
        this.leftMoment = leftMoment;
    }

    public float getRightMoment() {
        return rightMoment;
    }

    public void setRightMoment(float rightMoment) {
        this.rightMoment = rightMoment;
    }

    public Span(){

    }

    public Span(int id){
        this.id = id;
    }
    protected Span(Parcel in) {
        id = in.readInt();
        isSelected = in.readByte() != 0;
        plCount = in.readInt();
        udlCount = in.readInt();
        uvlCount = in.readInt();
        spanLength = in.readFloat();
        settlement_r = in.readFloat();
        settlement_l = in.readFloat();
        angle_r = in.readFloat();
        angle_l = in.readFloat();
        coeff_I = in.readFloat();
        a_left = in.readFloat();
        b_left = in.readFloat();
        c_left = in.readFloat();
        a_right = in.readFloat();
        b_right = in.readFloat();
        c_right = in.readFloat();
        leftSupport = in.readString();
        rightSupport = in.readString();
        in.readList(plValues, PLValue.class.getClassLoader());
        in.readList(udlValues, UDLValue.class.getClassLoader());
        in.readList(uvlValues, UVLValue.class.getClassLoader());
        leftMoment = in.readFloat();
        rightMoment = in.readFloat();
    }

    public static final Creator<Span> CREATOR = new Creator<Span>() {
        @Override
        public Span createFromParcel(Parcel in) {
            return new Span(in);
        }

        @Override
        public Span[] newArray(int size) {
            return new Span[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(@NonNull Parcel dest, int flags) {
        dest.writeInt(id);
        dest.writeByte((byte) (isSelected ? 1 : 0));
        dest.writeInt(plCount);
        dest.writeInt(udlCount);
        dest.writeInt(uvlCount);
        dest.writeFloat(spanLength);
        dest.writeFloat(settlement_r);
        dest.writeFloat(settlement_l);
        dest.writeFloat(angle_r);
        dest.writeFloat(angle_l);
        dest.writeFloat(coeff_I);
        dest.writeFloat(a_left);
        dest.writeFloat(b_left);
        dest.writeFloat(c_left);
        dest.writeFloat(a_right);
        dest.writeFloat(b_right);
        dest.writeFloat(c_right);
        dest.writeString(leftSupport);
        dest.writeString(rightSupport);
        dest.writeList(plValues);
        dest.writeList(udlValues);
        dest.writeList(uvlValues);
        dest.writeFloat(leftMoment);
        dest.writeFloat(rightMoment);
    }
}
