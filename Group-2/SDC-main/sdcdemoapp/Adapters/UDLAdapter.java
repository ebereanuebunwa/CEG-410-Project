package com.example.sdcdemoapp.Adapters;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.RadioGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.sdcdemoapp.Models.UDLValue;
import com.example.sdcdemoapp.R;

import java.util.ArrayList;

public class UDLAdapter extends RecyclerView.Adapter<UDLAdapter.MyviewHolder> {
    Context context;
    ArrayList<UDLValue> values;
    Float span;

    public UDLAdapter(Context context, ArrayList<UDLValue> values, Float span){
        this.context = context;
        this.values = values;
        this.span = span;
    }

    @NonNull
    @Override
    public UDLAdapter.MyviewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.udl_magnitude_layout, parent, false);
        return new UDLAdapter.MyviewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull UDLAdapter.MyviewHolder holder, @SuppressLint("RecyclerView") int position) {
        holder.distance.setHint("span");
        holder.value.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try{
                    float value = Float.parseFloat(s.toString());
                    values.get(position).setMagnitude(value);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.distance.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try{
                    float value = Float.parseFloat(s.toString());
                    values.get(position).setSpan(value);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.dist_from_left.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                try{
                    float value = Float.parseFloat(s.toString());
                    values.get(position).setDist_from_left(value);
                } catch (NumberFormatException e){
                    e.printStackTrace();
                }
            }
        });

        holder.udlRadio.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                if(checkedId == R.id.whole_button){
                    values.get(position).setLoadType("WholeSpan");
                    holder.distance.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.GONE);
                    holder.support_udl_radio.setVisibility(View.GONE);
                    holder.distance.setText(String.valueOf(span));
                    values.get(position).setSpan(span);
                } else if(checkedId == R.id.support_to_any_point){
                    values.get(position).setLoadType("SupportToAnyPoint");
                    holder.support_udl_radio.clearCheck();
                    holder.distance.setVisibility(View.GONE);
                    holder.dist_from_left.setVisibility(View.GONE);
                    holder.support_udl_radio.setVisibility(View.VISIBLE);
                    holder.distance.setText("");
                    holder.dist_from_left.setText("");
                    values.get(position).setSpan(0);
                } else if (checkedId == R.id.others) {
                    values.get(position).setLoadType("Others");
                    holder.distance.setText("");
                    holder.dist_from_left.setText("");
                    holder.distance.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.VISIBLE);
                    holder.support_udl_radio.setVisibility(View.GONE);
                }
            }
        });

        holder.support_udl_radio.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioGroup group, int checkedId) {
                if(checkedId == R.id.left_support){
                    holder.distance.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.GONE);
                    values.get(position).setAnchor("Left");
                } else if (checkedId == R.id.right_support) {
                    holder.distance.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.VISIBLE);
                    holder.dist_from_left.setVisibility(View.GONE);
                    values.get(position).setAnchor("Right");
                }
            }
        });
    }

    @Override
    public int getItemCount() {
        return values.size();
    }

    public class MyviewHolder extends RecyclerView.ViewHolder {
        EditText value, distance, dist_from_left;
        RadioGroup udlRadio, support_udl_radio;
        public MyviewHolder(@NonNull View itemView) {
            super(itemView);
            value = itemView.findViewById(R.id.value);
            distance = itemView.findViewById(R.id.distance);
            udlRadio = itemView.findViewById(R.id.udl_radio);
            support_udl_radio = itemView.findViewById(R.id.support_udl_radio);
            dist_from_left = itemView.findViewById(R.id.distance_from_left);
        }
    }
}
